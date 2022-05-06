import { Image } from '@rneui/themed';
import { getAuth } from 'firebase/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import { useState } from 'react';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '../components/Themed';
import { FirebaseApp } from '../firebaseConfig';
import { RootTabScreenProps } from '../types';

FirebaseApp;


export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const [teamname, setTeamname] = useState<string>('');
  const [teamleader, setTeamleader] = useState<string>('');
  const [leaderImg, setLeaderImg] = useState<string>('');
  const [memberList, setMemberList] = useState<Array<any>>();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase();
    const list = ref(db, 'member/'+user?.uid);
    onValue(list, (snapshot) => {
      const data = snapshot.val();
      // console.log(data.teamname);
      setTeamname(data.teamname);

      const list2 = ref(db, 'party/'+teamname);
      onValue(list2, (snapshot) => {
        const data = snapshot.val();
        if(snapshot.exists()){
          try{
            setTeamleader(data.makername);
            setLeaderImg(data.makerimage);
            if(snapshot.child('mem').exists()){
              setMemberList(Object.values(data.mem));
            }
          }catch(err){
            console.error('TabOneScreen useEffect err', err);
          }
        }
      })
    })

  }, [teamname, teamleader])

  const members = memberList?.map((value, i) => {
    return(
      <View style={styles.memView} key={i}>
        <Image source={{uri : value.image}} 
          PlaceholderContent={<ActivityIndicator/>}
          containerStyle={styles.leaderImg}
        />
        <Text style={styles.mem}>{ value.member }</Text>
      </View>
    )
  })
  
  return (
    <View style={styles.container}>
      <Text style={styles.gray}>팀명</Text>
      <View style={styles.top}>
        <Text style={styles.toptxt}>{teamname}</Text>
      </View>
      <Text style={styles.gray}>팀장</Text>
      <View style={styles.teamleader}>
        {
          leaderImg !== '' ?
          <Image source={{uri : leaderImg}} 
          // PlaceholderContent={<ActivityIndicator/>}
          containerStyle={styles.leaderImg}
          />
          :
          <View></View>
        }
       
        <Text  style={styles.mem}>{ teamleader }</Text>
      </View>
      <Text style={styles.gray}>일원</Text>
      <ScrollView>
        {members}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding : "2%"
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  top : {
    borderBottomWidth : 1,
    borderBottomColor : '#BEBEBE',
    height : 80,
    justifyContent : 'center',
    padding : "5%"
  },
  toptxt : {
    fontSize : 20
  },
  subtxt : {
    fontSize : 15
  },
  mem : {
    fontSize : 18
  },
  teamleader : {
    borderBottomWidth : 1,
    borderBottomColor : '#BEBEBE',
    padding : '2%',
    flexDirection : 'row',
    alignItems : 'center',
  },
  memView : {
    padding : '2%',
    flexDirection : 'row',
    alignItems : 'center'
  },
  leaderImg : {
    width : 40,
    height : 40,
    marginRight : 10,
    borderRadius : 30
  },
  gray : {
    fontSize : 15,
    color : 'gray',
  }

});
