import { StyleSheet } from "react-native";

import LottieView from 'lottie-react-native';


const LoadingAnimation = () => {
    return <LottieView 
    source={require('../assets/animations/51-preloader.json')}
    autoPlay
    loop
    style={{
        zIndex : 2,
        position : 'absolute',
        justifyContent:'center',
        alignSelf:'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }}
    />
}

export default LoadingAnimation;

