import { StatusBar } from 'expo-status-bar';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, onValue, push, ref, remove, set, update } from 'firebase/database';
import { useState } from 'react';
import { useEffect } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import {  RootStackScreenProps } from '../types';



export default function ModalScreen({navigation} : RootStackScreenProps<'Modal'>) {
  const [teamName, setTeamName] = useState<string>('');
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [partyJson, setPartyJson] = useState();
  const [memberUids, setMemberUids] = useState<Array<string>>([]);
  const [memberNames, setMemberNames] = useState<Array<string>>([]);
  const [memberImages, setMemberImages] = useState<Array<string>>([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase();
    const list = ref(db, 'member/'+user?.uid);
    onValue(list, (snapshot) => {
      const data = snapshot.val();
      setTeamName(data.teamname);

      onValue(ref(db, 'party/'+data.teamname), 
      (snapshot) => {
        if(snapshot.exists()){
          const data2 = snapshot.val();
          // console.log(data2);
          setPartyJson(data2);
          if(snapshot.child('leader').child('maker').exists()){
            if(user.uid === snapshot.child('leader').child('maker').val()){
              // console.log('맞네')
              setIsLeader(true);
            }
          }
         
          let uidArr = new Array();
          let nameArr = new Array();
          let imageArr = new Array();
          snapshot.child('mem').forEach((child) => {
            // console.log('zz',child.val().image);
            uidArr.push(child.key);
            nameArr.push(child.val().member);
            imageArr.push(child.val().image);
            setMemberUids(uidArr);
            setMemberNames(nameArr);
            setMemberImages(imageArr);
          })
        }
      })
    })
    
  }, []);

  const logout = () => {
    Alert.alert(
      '로그아웃','로그아웃 하시겠습니까?',
      [
        {
          text : '네',
          onPress : () => {
            const auth = getAuth();
            signOut(auth);
            navigation.navigate('Login');
          }
        },
        {
          text : '아니오',
          onPress : () => null
        }
      ]
    )
  }

  const resignParty = () => {
    Alert.alert(
      '탈퇴','팀을 탈퇴 하시겠습니까?',
      [
        {
          text : '네',
          onPress : () => {
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user.uid;
            const image = user.photoURL;
            const name = user.displayName;
            const db = getDatabase();
           
            set(ref(db,'member/'+uid),{
              name : name,
              image : image,
              teamname : ''
            })
            .then(() => {
              // console.log('url' , 'party/' + teamName + '/mem/' + uid);
              remove(ref(db, 'party/' + teamName + '/mem/' + uid ))
              .then(() => {
                navigation.navigate("Home"); 
              })
            })
            
          }
        },
        {
          text : '아니오',
          onPress : () => null
        }
      ]
    )
  }

  const dismissParty = () => {
    Alert.alert(
      '정말','팀을 해체 하시겠습니까?',
      [
        {
          text : '네',
          onPress : () => {
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user.uid;
            const image = user.photoURL;
            const name = user.displayName;
            const db = getDatabase();
           
            set(ref(db,'member/'+uid),{
              name : name,
              image : image,
              teamname : ''
            })
            .then(() => {
              // console.log('url' , 'party/' + teamName + '/mem/' + uid);
              push(ref(db, 'deletedParty/'),partyJson)
              .then(()=>{
                remove(ref(db, 'party/' + teamName))
                .then(() => {
                 // 이전에 member 팀네임도 초기화 시켜야댐
                 const updates : any = {};
                 memberUids.forEach((val, index)=>{
                   const updateData = {
                     image : memberImages[index],
                     name : memberNames[index],
                     teamname : ''
                   }
                   console.log(memberUids[index]);
                   updates['member/'+memberUids[index]] = updateData;
                 }) 
                //  console.log(updates);
                 update(ref(db),updates)
                 .then(() => {
                   navigation.navigate("Home"); 
                 })
                })
              })
              
            })
            
          }
        },
        {
          text : '아니오',
          onPress : () => null
        }
      ]
    )
  }


  return (
    <View style={styles.container}>
      {
        !isLeader ?
        <TouchableOpacity style={styles.block}
          onPress={resignParty}
        >
          <Text style={styles.text}>팀 탈퇴</Text>
        </TouchableOpacity>
        :
        <View></View>
      }
      {
        isLeader ?
        <TouchableOpacity style={styles.block}
          onPress={dismissParty}
        >
          <Text style={styles.text}>팀 해체</Text>
        </TouchableOpacity>
        :
        <View></View>
      }
       <TouchableOpacity style={styles.block}
        onPress={() => {navigation.navigate('UpdateUser')}}
      >
        <Text style={styles.text}>사용자 정보 수정</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.block}
        onPress={logout}
      >
        <Text style={styles.logout}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  block : {
    height : 40,
    borderBottomWidth : 1,
    margin : '2%',
    borderBottomColor : '#BEBEBE'
  },
  text : {
    fontSize : 18
  },
  logout : {
    fontSize : 18,
    color : '#F44336'
  }
});
