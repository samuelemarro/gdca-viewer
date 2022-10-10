import AES from 'crypto-js/aes';
import { enc } from 'crypto-js';
import path from 'path';
import { promises as fs } from 'fs';

const delay = ms => new Promise(res => setTimeout(res, ms));

const answer = async (response, req, res) => {
    await delay(5000)
    res.status(200).json(response)
}

export default async function handler(req, res) {
    //await writeCryptedFile('test2.txt', '{"a" : "test", "b": "test2"}')
    console.log(await loadCryptedFile('test2.txt'))
    await answer({ success: true, filename: 'file1.txt', content: 'TEST', extra: 'solo con thorus'}, req, res)
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
    await fs.writeFile(txtDirectory + '/' + name,  AES.encrypt(content, 'secretPassphrase').toString())

    //return AES.decrypt(fileContents, 'secretPassphrase').toString(enc.Latin1);
}


async function loadCryptedFile(name) {
    const txtDirectory = path.join(process.cwd(), '/assets/txt')
    console.log(txtDirectory)
    //Read the json data file data.json
    const fileContents = await fs.readFile(txtDirectory + '/' + name, 'utf8')
    //console.log('Encrypted:', AES.encrypt('CIAO', 'secretPassphrase').toString())

    //await fs.writeFile(txtDirectory + '/test.txt',  AES.encrypt('CIAO', 'secretPassphrase').toString())
    console.log('Decrypted:', AES.decrypt(fileContents, 'secretPassphrase').toString(enc.Latin1))

    return JSON.parse(AES.decrypt(fileContents, 'secretPassphrase').toString(enc.Latin1));
}