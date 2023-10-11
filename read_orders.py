import json
import os
import re

import click
import numpy as np

MAP_WIDTH = 17
MAP_HEIGHT = 13
MAX_HEALTH = 4
STARTING_URGE_DAY = 6

VOTES = {}
TANKS = {}

def range_distance(position_a, position_b):
    return max(abs(position_a[0] - position_b[0]), abs(position_a[1] - position_b[1]))

def parse_retry_policy(args):
    other_args = []

    for i, arg in enumerate(args):
        if arg in ['riprova', 'retry', 'rip']:
            if i == len(args) - 1:
                retry_amount = 1
                print(f'AVVISO: Nessun numero di ripetizioni specificato per riprova. Trattando come 1')
            else:
                try:
                    retry_amount = int(args[i + 1])
                except:
                    raise RuntimeError(f'ERRORE: Numero di ripetizioni non valido: {args[i + 1]}')
                return other_args, {
                    'retry_policy': 'retry',
                    'retry_amount': retry_amount
                }
        elif arg in ['ignora', 'ignore']:
            return other_args, {
                'retry_policy': 'ignore'
            }
        elif arg in ['abort', 'stop', 'annulla']:
            return other_args, {
                'retry_policy': 'abort'
            }
        else:
            other_args.append(arg)
    
    return other_args, { 'retry_policy': 'ignore' }

def parse_position(position):
    position = position.upper()

    # Convert e.g. 'B5' into [4, 2]
    y = ord(position[0]) - 65
    x = int(position[1:]) - 1
    return [x, y]

def format_position(x, y):
    # Convert e.g. [4, 2] into 'B5'
    return chr(y + 65) + str(x + 1)


class Order:
    def __init__(self, issuer, type, target=None, hp_amount=None, retry_policy='ignore', retry_amount=None, executed=False):
        self.issuer = issuer
        self.type = type
        self.target = target
        self.hp_amount = hp_amount
        self.retry_policy = retry_policy
        self.retry_amount = retry_amount
        self.executed = executed
    
    def __repr__(self):
        s = f'Ordine({self.issuer} {self.type}'
        
        if self.hp_amount is not None:
            s += f' {self.hp_amount}'
        
        s += f' {self.target} {self.retry_policy}'
        if self.retry_amount is not None:
            s += f' {self.retry_amount}'

        return s + ')'

class Tank:
    def __init__(self, id, position, health, range, urge, tank_data, aps=None, commited_aps=None, orders=None, has_moved=False, has_damaged=False, joy=False, killed_by=None, death_position=None, death_day=None):
        self.id = id
        self.position = position
        self.health = health
        self.range = range
        self.urge = urge
        self.tank_data = tank_data
        self.aps = aps
        self.commited_aps = commited_aps
        self.orders = orders
        self.has_moved = has_moved
        self.has_damaged = has_damaged
        self.joy = joy
        self.killed_by = killed_by
        self.death_position = death_position
        self.death_day = death_day

    def __repr__(self):
        return f'Tank ({self.id} {self.position} {self.health} {self.range} {self.urge} {self.orders} {self.joy} {self.killed_by} {self.killed_by} {self.death_position})'
    
    @property
    def dead(self):
        return self.health <= 0
    
    @property
    def next_order(self):
        if self.dead or self.orders is None:
            return None
        
        for order in self.orders:
            if not order.executed:
                return order
        
        return None

def parse_map(map_data, tank_data):
    for tank_id, tank_info in map_data.items():
        TANKS[tank_id] = Tank(
            id=tank_id,
            position=parse_position(tank_info['position']) if 'position' in tank_info else None,
            health=tank_info['health'] if 'health' in tank_info else 0,
            range=tank_info['range'] if 'range' in tank_info else 0,
            urge=tank_info['urge'] if 'urge' in tank_info else 0,
            tank_data=tank_data[tank_id],
            death_day=tank_info['deathDay'] if 'deathDay' in tank_info else None,
            death_position=tank_info['deathPosition'] if 'deathPosition' in tank_info else None,
            killed_by=tank_info['killedBy'] if 'killedBy' in tank_info else None
        )

def parse_orders(text):
    current_tank_id = None
    committed_aps = None
    current_orders = []

    def commit_tank():
        nonlocal current_tank_id, committed_aps, current_orders
        if current_tank_id is not None:
            TANKS[current_tank_id].orders = current_orders
            TANKS[current_tank_id].commited_aps = committed_aps
            current_orders = []
            committed_aps = None
            current_tank_id = None
            print(f'Fine {current_tank_id}')

    for line in text.split('\n'):
        line = line.split('#')[0] # Remove comments
        line = line.split('.')[-1] # Skip line numbers

        line = re.sub(r'\s+', ' ', line)
        line = line.strip().lower()

        if line == '':
            # Empty line
            continue

        if line.endswith(':'):
            # Tank declaration
            if current_tank_id is not None:
                commit_tank()

            line = line[:-1]
            args = line.split(' ')
            current_tank_id = args[0]

            if current_tank_id not in TANKS:
                raise RuntimeError(f'ERRORE: tank {current_tank_id} non trovato')

            if not TANKS[current_tank_id].dead:
                try:
                    committed_aps = int(args[1])
                except:
                    raise RuntimeError(f'ERRORE: APs non validi per {current_tank_id}')

                print(f'Inizio {current_tank_id} ({committed_aps})')

                if committed_aps > TANKS[current_tank_id].aps:
                    raise RuntimeError(f'ERRORE: APs non sufficienti per {current_tank_id}')
        else:
            # Order declaration
            args = line.split(' ')

            other_args, retry_kwargs = parse_retry_policy(args)

            if other_args[0] not in ['vote', 'vota', 'voto'] and TANKS[current_tank_id].dead:
                raise RuntimeError(f'ERRORE: tank {current_tank_id} è morto')

            if other_args[0] in ['mv', 'muovi']:
                # Movement order
                current_orders.append(
                    Order(
                        issuer=current_tank_id,
                        type='move',
                        target=other_args[1],
                        **retry_kwargs
                    )
                )
            elif other_args[0] in ['st', 'shoot', 'spara']:
                # Shoot order
                current_orders.append(
                    Order(
                        issuer=current_tank_id,
                        type='shoot',
                        target=other_args[1],
                        **retry_kwargs
                    )
                )
            elif other_args[0] in ['sk', 'skip', 'salta', 'passa']:
                # Skip order
                current_orders.append(
                    Order(
                        issuer=current_tank_id,
                        type='skip',
                        retry_policy='ignore' # Skips always succeed
                    )
                )
            elif other_args[0] in ['cedi', 'hp', 'cedihp']:
                # Transfer HP order
                if len(other_args) > 2:
                    try:
                        hp_amount = int(other_args[2])
                    except:
                        raise RuntimeError(f'ERRORE: quantità di HP non valida: {other_args[2]}')
                else:
                    hp_amount = 1
                current_orders.append(
                    Order(
                        issuer=current_tank_id,
                        type='transfer_hp',
                        target=other_args[1],
                        hp_amount=hp_amount,
                        **retry_kwargs
                    )
                )
            elif other_args[0] in ['range', 'upgrade']:
                # Upgrade range order
                current_orders.append(
                    Order(
                        issuer=current_tank_id,
                        type='upgrade_range',
                        **retry_kwargs
                    )
                )
            elif other_args[0] in ['vote', 'vota', 'voto']:
                if not TANKS[current_tank_id].dead:
                    raise RuntimeError('ERRORE: solo i morti possono votare')
                if len(other_args) < 3:
                    votes = 1
                else:
                    try:
                        votes = int(other_args[2])
                    except:
                        raise RuntimeError(f'ERRORE: numero di voti non valido: {other_args[1]}')
                
                if votes < 1:
                    raise RuntimeError(f'ERRORE: numero di voti non valido: {votes}')
                
                votee = other_args[1]
                if votee not in VOTES:
                    VOTES[votee] = 0
                VOTES[votee] += votes
            else:
                raise RuntimeError(f'ERRORE: ordine non riconosciuto: {other_args[0]}')
    commit_tank()


def parse_target(issuer, target, convert_position_to_tank=True):
    # The target can be:
    # - A tank ID
    # - A position
    # - A relative position (N, NE, E, SE, S, SW, W, NW)

    if target in TANKS:
        return TANKS[target]
    elif target in ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']:
        # Compute the relative position
        x, y = TANKS[issuer].position
        print(x, y)
        if 'n' in target:
            y -= 1
        if 's' in target:
            y += 1
        if 'e' in target:
            x += 1
        if 'w' in target:
            x -= 1
        
        # Check that the position is valid
        print(x, y)
        print(x < 0, x >= MAP_WIDTH, y < 0, y >= MAP_HEIGHT)
        if x < 0 or x >= MAP_WIDTH or y < 0 or y >= MAP_HEIGHT:
            raise RuntimeError(f'ERRORE: posizione non valida: {target}')
    elif re.match(r'[a-z][0-9]+', target):
        # Position
        x, y = parse_position(target)
    else:
        raise RuntimeError(f'ERRORE: target non valido: {target}')

    if convert_position_to_tank:
        for tank in TANKS.values():
            if tank.position == [x, y]:
                return tank
    
    return [x, y]

def apply_order(order, day, new_damages, new_movements):
    print(f'{order.issuer}:', order)
    if order.type == 'transfer_hp':
        target = parse_target(order.issuer, order.target)
        if isinstance(target, Tank):
            distance = range_distance(TANKS[order.issuer].position, target.position)

            if distance > TANKS[order.issuer].range:
                print(f'FALLIMENTO: {order.issuer} non ha abbastanza range per trasferire HP a {order.target}')
                return False
            elif target.dead:
                print(f'FALLIMENTO: {order.target} è morto, non può ricevere HP')
                return False
            elif target.health >= MAX_HEALTH:
                print(f'FALLIMENTO: {order.target} ha già HP al massimo')
                return False
            else:
                print(f'{order.issuer} trasferisce 1 HP a {order.target}')
                target.health += 1
                TANKS[order.issuer].health -= 1
        else:
            raise RuntimeError(f'ERRORE: target non valido per trasferimento di HP: {order.target}')
    
    elif order.type == 'upgrade_range':
        max_range = np.ceil(day / 5) + 2
        if TANKS[order.issuer].range >= max_range:
            print(f'FALLIMENTO: {order.issuer} ha già range al massimo')
            return False
        
        if TANKS[order.issuer].commited_aps < 3:
            print(f'FALLIMENTO: {order.issuer} non ha dedicato abbastanza AP per l\'upgrade')
            return False
    
        print(f'{order.issuer} aumenta il range')
        TANKS[order.issuer].range += 1
        TANKS[order.issuer].commited_aps -= 3
        TANKS[order.issuer].aps -= 3

    elif order.type == 'shoot':
        target = parse_target(order.issuer, order.target)
        if isinstance(target, Tank):
            if target.dead:
                print(f'FALLIMENTO: {target.id} è morto, non può essere colpito')
                return False
            distance = range_distance(TANKS[order.issuer].position, target.position)

            # Shooting has one less range
            if distance > TANKS[order.issuer].range - 1:
                print(f'FALLIMENTO: {order.issuer} non ha abbastanza range per sparare a {target.id}')
                return False
            
            if TANKS[order.issuer].commited_aps < 1:
                print(f'FALLIMENTO: {order.issuer} non ha dedicato abbastanza AP per sparare')
                return False
            
            print(f'{order.issuer} spara a {target}')
            TANKS[order.issuer].commited_aps -= 1
            TANKS[order.issuer].aps -= 1
            TANKS[order.issuer].has_damaged = True
            
            if not target.id in new_damages:
                new_damages[target.id] = []
            
            new_damages[target.id].append(order.issuer)
        else:
            print(f'FALLIMENTO: {order.issuer} non può sparare a {order.target}')
    elif order.type == 'move':
        target = parse_target(order.issuer, order.target, convert_position_to_tank=False)
        distance = range_distance(TANKS[order.issuer].position, target)
        if distance > 1:
            print(f'FALLIMENTO: {order.issuer} non può muoversi di più di una casella')
            return False

        if TANKS[order.issuer].commited_aps < 1 and TANKS[order.issuer].has_moved:
            print(f'FALLIMENTO: {order.issuer} non ha dedicato abbastanza AP per muoversi')
            return False
        
        print(f'{order.issuer} prova a muoversi in {format_position(target[0], target[1])}')
        
        new_movements[order.issuer] = (order, target)

    elif order.type == 'skip':
        print(f'{order.issuer} passa.')
    else:
        raise RuntimeError(f'ERRORE: ordine non valido: {order.type}')
    
    return True

def handle_failure(order : Order, success):
    if success:
        order.executed = True
    else:
        if order.retry_policy == 'ignore':
            order.executed = True
            print('Ordine fallito, ignora.')
        elif order.retry_policy == 'retry':
            order.retry_amount -= 1
            if order.retry_amount <= 0:
                order.executed = True
                print('Ordine fallito, non riprova.')
            else:
                print(f'Ordine fallito, riprova altre {order.retry_amount} volte.')
        elif order.retry_policy == 'abort':
            tank_orders = TANKS[order.issuer].orders

            for tank_order in tank_orders:
                tank_order.executed = True
            
            print('Ordine fallito, annulla tutto.')
        else:
            raise RuntimeError(f'ERRORE: retry policy non valida: {order.retry_policy}')


def handle_movements(new_movements):
    for mover, (order, target) in new_movements.items():
        collision = False

        for other_players in TANKS.values():
            if other_players.dead:
                continue

            if other_players.id == mover:
                continue

            if other_players.position == target:
                collision = True
                break
        
        for other_mover, (_, other_target) in new_movements.items():
            if other_mover == mover:
                continue

            if other_target == target:
                collision = True
                break

        success = None

        answer = None

        if collision:
            while answer not in ['y', 'n']:
                print(f'{mover} riesce a muoversi in {format_position(target[0], target[1])}? (y/n)')
                answer = input()
                if answer == 'y':
                    success = True
                elif answer == 'n':
                    success = False
        else:
            print(f'{mover} si muove senza ostacoli a {format_position(target[0], target[1])}')
            success = True
        
        if success:
            if TANKS[mover].has_moved:
                TANKS[mover].ap -= 1
                TANKS[mover].commited_aps -= 1
                print(f'{mover} ha già mosso, perde 1 AP e scende a {TANKS[mover].ap}')
            else:
                print(f'{mover} usa il suo primo movimento')
            TANKS[mover].position = target
            TANKS[mover].has_moved = True

        handle_failure(order, success)


def handle_movements_advanced(new_movements):
    # Check that no tank is moving to the same position
    
    old_occupied_positions = set()

    for tank in TANKS.values():
        if tank.dead:
            continue
        
        old_occupied_positions.add(tuple(tank.position))
    
    new_occupied_positions = set()
    for tank in TANKS.values():
        if tank.dead:
            continue
        
        if tank.id in new_movements:
            new_occupied_positions.add(tuple(new_movements[tank.id][1]))
        else:
            new_occupied_positions.add(tuple(tank.position))
    
    problematic_movements = set()

    for mover, (_, target) in new_movements.items():
        if tuple(target) in new_occupied_positions or target in old_occupied_positions:
            problematic_movements.add(mover)
    
    for mover, (order, target) in new_movements.items():
        success = None
        if mover in problematic_movements:
            matching_tank = None

            print(f'Possibile fallimento: {mover} si muove in una casella potenzialmente occupata da un altro tank.')
            print('Riesce a muoversi? (y/n)')
            answer = input()
            if answer == 'y':
                success = True
            else:
                success = False
        else:
            success = True
        
        if success:
            if TANKS[mover].has_moved:
                TANKS[mover].ap -= 1
                TANKS[mover].commited_aps -= 1
                print(f'{mover} ha già mosso, perde 1 AP e scende a {TANKS[mover].ap}')
            else:
                print(f'{mover} si muove in {target}')
            TANKS[mover].position = target
            TANKS[mover].has_moved = True

        handle_failure(order, success)

def apply_orders(day):
    for tank_id, tank in TANKS.items():
        if not tank.dead and tank.orders is None:
            print(f'AVVISO: nessun ordine per {tank_id}')
            tank.commited_aps = 0


    for turn_number in range(5):
        print(f'TURNO {turn_number + 1}')
        # 1. Collect the orders for this turn. These are defined as the first non-executed orders
        turn_orders = []

        for tank_id, tank in TANKS.items():
            if tank.next_order is not None:
                turn_orders.append(tank.next_order)
        
        # 2. Sort the orders by type. The priority is:
        #   1. transfer_hp
        #   2. upgrade_range
        #   3. shoot
        #   4. move
        #   5. skip
        #   6. death

        turn_orders.sort(key=lambda x: {
            'transfer_hp': 1,
            'upgrade_range': 2,
            'shoot': 3,
            'move': 4,
            'skip': 5
        }[x.type])

        new_damages = {}
        new_movements = {}

        # 3. Execute the orders before the movement
        for order in [x for x in turn_orders if x.type in ['transfer_hp', 'upgrade_range', 'shoot']]:
            success = apply_order(order, day, new_damages, new_movements)
            handle_failure(order, success)

        # 4. Execute the movement orders
        for order in [x for x in turn_orders if x.type == 'move']:
            apply_order(order, day, new_damages, new_movements)

        # 5. Handle movements and collisions
        handle_movements(new_movements)

        # 5. Execute the orders after the movement
        for order in [x for x in turn_orders if x.type == 'skip']:
            success = apply_order(order, day, new_damages, new_movements)
            handle_failure(order, success)
        
        # 6. Apply damages
        for target, damagers in new_damages.items():
            TANKS[target].health -= len(damagers)
            if TANKS[target].dead:
                TANKS[target].killed_by = damagers
                TANKS[target].death_day = day
                print(f'{target} è stato ucciso da {damagers}')
            
                # Only single kills are valid for the joy
                if len(damagers) == 1:
                    TANKS[damagers[0]].joy = True

        input('Premi invio per continuare...')

    for tank_id, tank in TANKS.items():
        if tank.dead:
            continue

        if tank.aps > 3:
            print(f'AVVISO: {tank_id} ha troppi AP. Abbassando a 3')
            tank.aps = 3
        elif tank.aps < 0:
            raise RuntimeError(f'ERRORE: {tank_id} ha AP negativi')

        # Each player receives 1 AP per day
        tank.aps += 1

        print(f'{tank_id} ha {tank.aps} AP.')

        
        if tank.commited_aps > 0:
            print(f'{tank_id} non ha usato {tank.commited_aps} AP che erano nella busta.')
        
        if tank.has_damaged:
            tank.urge = 0
            print(f'{tank_id} ha sparato, urgio resettato.')
        else:
            tank.urge += 1
            print(f'{tank_id} non ha sparato, urgio sale a {tank.urge}')

        if tank.urge >= 4 and day >= STARTING_URGE_DAY:
            tank.health -= 1
            print(f'{tank_id} ha urgio 4, perde 1 HP e scende a {tank.health}.')
        
        if tank.dead:
            print(f'{tank_id} è morto per cause naturali.')
            tank.killed_by = 'natural'
            tank.death_day = day
        
        if tank.joy:
            if tank.dead:
                print(f'{tank_id} avrebbe tratto gaudio, ma è morto.')
            elif tank.health >= MAX_HEALTH:
                print(f'{tank_id} ha tratto gaudio, ma ha già HP al massimo.')
            else:
                tank.health += 1
                print(f'{tank_id} ha tratto gaudio, guadagna 1 HP e sale a {tank.health}.')

    print('RISULTATO VOTI:')
    for tank_id, votes in VOTES.items():
        print(f'{tank_id}: {votes} voti')
    
    # If there's a candidate with more votes than any other, they receive 1 extra AP
    if len(VOTES) == 0:
        print('Nessun voto espresso.')
    else:
        max_votes = max(VOTES.values())
        if max_votes > 0:
            candidates = [tank_id for tank_id, votes in VOTES.items() if votes == max_votes]
            if len(candidates) == 1:
                print(f'{candidates[0]} ha vinto le elezioni e riceve 1 AP bonus.')
                TANKS[candidates[0]].aps += 1
            else:
                print(f'Le elezioni sono finite in parità tra {", ".join(candidates)}.')

@click.command()
@click.argument('day', type=int)
def main(day):
    # 1. Parse the map

    map_data = json.load(open(f'public/dayInfo/{day - 1}.json', 'r'))
    tank_data = json.load(open(f'assets/json/tankData.json', 'r', encoding='utf-8'))

    parse_map(map_data, tank_data)


    # 2. Read the current Action Points

    action_points = json.load(open(f'aps/{day - 1}_after.json', 'r'))

    for k, v in action_points.items():
        TANKS[k].aps = v
    
    for tank_id, tank in TANKS.items():
        if tank.dead:
            continue

        if tank.aps is None:
            print(f'AVVISO: AP non definiti per {tank_id}. Trattando come 1000')
            tank.aps = 1000

    if os.path.exists(f'aps/{day}_transfers.json'):
        transfers = json.load(open(f'aps/{day}_transfers.json', 'r'))

        for tank_id, v in transfers.items():
            TANKS[tank_id].aps -= v['amount']
            TANKS[v['target']].aps += v['amount']

        # Check that no tank is negative
        for tank_id, tank in TANKS.items():
            if tank.dead:
                continue

            if tank.aps < 0:
                raise RuntimeError(f'ERRORE: AP negativi per {tank_id}')

    # 3. Read the current orders
    orders = open(f'orders/{day}.txt').read()
    parse_orders(orders)

    # 4. Apply the orders
    apply_orders(day)

    new_map_data = {}

    # 7. Save the new state of the map
    for tank_id, tank in TANKS.items():
        if tank.dead:
            new_map_data[tank_id] = {
                'deathDay' : tank.death_day,
                'killedBy' : tank.killed_by,
                'deathPosition' : tank.death_position
            }
        else:
            new_map_data[tank_id] = {
                'position': format_position(tank.position[0], tank.position[1]),
                'health': tank.health,
                'range': tank.range,
                'urge': tank.urge
            }
    with open(f'public/dayInfo/{day}.json', 'w') as f:
        json.dump(new_map_data, f, indent=4)

    # 8. Save the new action points
    with open(f'aps/{day}_after.json', 'w') as f:
        json.dump({ k: v.aps for k, v in TANKS.items() }, f, indent=4)

if __name__ == '__main__':
    main()