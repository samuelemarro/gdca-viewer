import { useRecoilState } from "recoil";
import { secretsState } from "../common/data";
import md5 from "js-md5";
import { packagesState } from "../common/data";

export default function Document({name, crypted, content, extra}) {
    const [secrets, setSecrets] = useRecoilState(secretsState)
    const [packages, setPackages] = useRecoilState(packagesState)

    const garbage = () => {
        let total = ''
        let hash = md5.create()
        let currentKey = name
        while (total.length < 500) {
            if (total.length >= currentKey.length) {
                currentKey = total
            }
            const i = hash.array(currentKey)[total.length]
            const char = String.fromCharCode((i % (127 - 32)) + 32)
            total += char
        }

        return total
    }
    // console.log(secrets)

    const thorusWrapped = (str) => {
        const actualExtra = extra || secrets[name]?.extra
        let finalString
        if (actualExtra && packages.includes('thorus')) {
            finalString = str + '\n\n====THORUS v1.2.4====\nRILEVATE INFORMAZIONI AGGIUNTIVE\n\n' + actualExtra + '\n\n====================='
        } else {
            finalString = str
        }

        if (!finalString) {
            return 'Impossibile caricare il file.'
        }
        finalString = finalString.replace('5305', '5375')

        return finalString.split('\n').map((str, i) => <p className={str.includes('https') ? 'noUppercase' : ''} key={i}>{str || <br/>}</p>)
    }

    return (
        crypted ? (
            secrets[name] ? (
                thorusWrapped(secrets[name].content)
            ) : 'Questo file è criptato.'
        ) : thorusWrapped(content)
    )
}