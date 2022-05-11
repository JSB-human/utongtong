import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


export async function registerForPushNotificationsAsync() {
  // console.log('n tsx')
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        // console.log('!granted');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      // console.log('aa',token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
  }

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
export async function sendPushNotification(expoPushToken: any) {
  // console.log(expoPushToken)
//   // 키 나중에 가리기
//   await fetch('https://fcm.googleapis.com/fcm/send', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: `key=AAAA2fEYM0Q:APA91bGGy7ny_MlqAmAlkR8Ysf3p6O20xVcCZed6Ligq-Q9OHjVNqfDuHTuoaLcC42EI_y9dNfvZ0l8Xb9KLTPZ4OxrtRfchPOmsoY_NOZCTH2KEcOJVLNqyGWfjaB3YdVjejZKhjgLf`,
//   },
//   body: JSON.stringify({
//     to: expoPushToken,
//     priority: 'normal',
//     data: {
//       experienceId: '@verysleepynow/utongtong',
//       scopeKey: '@verysleepynow/utongtong',
//       title: "You've got mail",
//       message: 'Hello world!',
//     },
//   }),
// });

const message = {
  to: expoPushToken,
  sound: 'default',
  title: 'Original Title',
  body: 'And here is the body!',
  data: { someData: 'goes here' },
};
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
}