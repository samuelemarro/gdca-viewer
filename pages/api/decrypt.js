import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import path from 'path';
import { promises as fs } from 'fs';

const dev = process.env.NODE_ENV !== 'production';

const server = dev ? 'http://localhost:3000' : 'https://csp-database.vercel.app';

const delay = ms => new Promise(res => setTimeout(res, ms));

const answer = async (response, req, res) => {
    // await delay(5000)
    console.log('Success: ', response.success)
    res.status(200).json(response)
}

const getMatchingFile = (key) => {
    if (!key) return

    const pairs = process.env.KEYS.split(';')
    // console.log('pairs:', pairs)
    const mappings = {}
    for (const pair of pairs) {
        const elements = pair.split(':')
        // console.log('Elements:', elements)
        if (elements.length == 2) {
            mappings[elements[0]] = elements[1]
        }
    }
    // console.log('Mappings:', mappings)
    return mappings[key]
}

export default async function handler(req, res) {
    console.log('Decrypt request. Key: ', req.query?.key, ', tracking: ', req.query?.tracking)
    let key = req.query?.key
    if (key) {
        key = key.toLowerCase().trim()
    }
    if (req.query?.tracking == 'BCIC') {
        await answer({success: false}, req, res)
        return
    }
    const matchingFile = getMatchingFile(key)
    if (matchingFile) {
        console.log('Query matches file ', matchingFile)
        try {
            const jsonFile = await loadCryptedFile(matchingFile)
            console.log('Loaded file correctly')
            await answer({success: true, filename: matchingFile, ...jsonFile}, req, res)
        } catch (e) {
            console.log('Error: failed to load file')
            console.log(e)
            await answer({success: false}, req, res)
        }
    } else {
        console.log('No matching file.')
        await answer({success: false}, req, res)
    }
    // await writeCryptedFile('test2.txt', '{"a" : "test", "b": "test2"}')
    // console.log(await loadCryptedFile('test2.txt'))
    // await answer({ success: true, filename: 'file1.txt', content: 'TEST', extra: 'solo con thorus'}, req, res)
    // res.status(200).json({ name: 'John Doe' })
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

async function writeCryptedFile(name, content) {
    const txtDirectory = path.join(process.cwd(), '/assets/txt')
    await fs.writeFile(txtDirectory + '/' + name,  AES.encrypt(content, process.env.PASSPHRASE).toString())

    //return AES.decrypt(fileContents, 'secretPassphrase').toString(enc.Latin1);
}

async function loadCryptedFile(name) {
    //Read the json data file data.json
    const fileContents = await fetch(server + '/files/' + name).then(res => res.text())
    //console.log('Encrypted:', AES.encrypt('CIAO', 'secretPassphrase').toString())

    //await fs.writeFile(txtDirectory + '/test.txt',  AES.encrypt('CIAO', 'secretPassphrase').toString())
    // console.log('Decrypted:', AES.decrypt(fileContents, 'secretPassphrase').toString(enc.Latin1))

    return JSON.parse(AES.decrypt(fileContents, process.env.PASSPHRASE).toString(enc.Latin1));
}


async function loadCryptedFile2(name) {
    const txtDirectory = path.join(process.cwd(), '/assets/txt')
    console.log(txtDirectory)
    //Read the json data file data.json
    const fileContents = await fs.readFile(txtDirectory + '/' + name, 'utf8')
    //console.log('Encrypted:', AES.encrypt('CIAO', 'secretPassphrase').toString())

    //await fs.writeFile(txtDirectory + '/test.txt',  AES.encrypt('CIAO', 'secretPassphrase').toString())
    console.log('Decrypted:', AES.decrypt(fileContents, process.env.PASSPHRASE).toString(enc.Latin1))

    return JSON.parse(AES.decrypt(fileContents, process.env.PASSPHRASE).toString(enc.Latin1));
}