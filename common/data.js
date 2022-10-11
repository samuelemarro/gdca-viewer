import { atom, RecoilRoot, useRecoilState } from 'recoil'
import { recoilPersist } from 'recoil-persist'

const { persistAtom } = recoilPersist()

const secretsState = atom({
    key: 'secrets',
    default: {},
    effects_UNSTABLE: [persistAtom],
})

const loggedInState = atom({
    key: 'loggedIn',
    default: false,
    effects_UNSTABLE: [persistAtom]
})

const packagesState = atom({
    key: 'packages',
    default: [],
    effects_UNSTABLE: [persistAtom]
})

const versionState = atom({
    key: 'version',
    default: 1,
    effects_UNSTABLE: [persistAtom]
})

const trackingState = atom({
    key: 'tracking',
    default: null,
    effects_UNSTABLE: [persistAtom]
})

export {
    loggedInState,
    secretsState,
    packagesState,
    trackingState,
    versionState
}