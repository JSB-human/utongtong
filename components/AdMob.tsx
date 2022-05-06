import { Platform } from "react-native";
import {
    AdMobBanner
} from 'expo-ads-admob';

const adBannerUnitId = Platform.OS === 'android' ?
    'ca-app-pub-2428762540238019~6626956638'
    :
    'ios 광고 id';

export const BottomBannerAds = () => (
    <AdMobBanner 
        bannerSize="banner"
        adUnitID={adBannerUnitId}
        servePersonalizedAds
        onDidFailToReceiveAdWithError={(err) => {console.error(err);}}
    />
)