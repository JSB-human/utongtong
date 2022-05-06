import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import LoadingAnimation from '../components/Loading';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import CalendarStrip from 'react-native-calendar-strip';
import { useState } from 'react';
import moment from 'moment';
import { Button } from '@rneui/themed';
import { Image } from '@rneui/base';
import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import AnimatedLottieView from 'lottie-react-native';

const chartHeight = Dimensions.get('window').height;
const chartWidth = Dimensions.get('window').width;

const locale = {
  name : 'ko',
  config : {
    months : '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split(
      '_'
    ),
    weekdays : '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
    weekdaysShort: '일_월_화_수_목_금_토'.split('_'),
    weekdaysMin: '일_월_화_수_목_금_토'.split('_'),
  }
}

export default function TabThreeScreen({ navigation }: RootTabScreenProps<'TabThree'>) {
  const [selectedDate, setSelectedDate] = useState<moment.Moment>();
  const [listdata, setListdata] = useState<Array<any>>(null);
  const [teamName, setTeamName] = useState<string>('');

  useEffect(()=>{
    const auth = getAuth();
    const user = auth.currentUser;  
    const db = getDatabase();
    const list = ref(db, 'member/'+user?.uid);
    onValue(list, (snapshot) => {
      const data = snapshot.val();
      setTeamName(data.teamname);
    }, {
      onlyOnce:true
    })


    const finishRef = ref(db, 'work/'+teamName+'/'+moment(selectedDate).format('YYYYMMDD')+'/finish');
    onValue(finishRef, (snapshot) => {
      try {
        if(snapshot.exists()){
          const data2 = snapshot.val();
          setListdata(Object.values(data2));
        }else{
          setListdata(null);
        }
      } catch (error) {
        console.error(error);
      }
    });


  },[selectedDate])

  return (
    <View style={styles.container}>
      <CalendarStrip
       scrollable
      style={{height:120, paddingTop: 20, paddingBottom: 10}}
      calendarColor={'#009688'}
      calendarHeaderStyle={{color: 'white'}}
      dateNumberStyle={{color: 'white'}}
      dateNameStyle={{color: 'white'}}
      highlightDateNumberStyle={{color: '#cddc39'}}
      highlightDateNameStyle={{color: '#cddc39'}}
      selectedDate={selectedDate}
      locale={locale}
      iconContainer={{flex: 0.1}}
      onDateSelected={date => setSelectedDate(date)}
      />
      <ScrollView style={styles.container}>
        {
          listdata !== null ? 
          listdata.map((value, i) => {
            return(
              <View key={i}
                style={styles.finishTouch}
              >
              <View style={styles.waitWriterTop}>
                  {/* <Text style={styles.gray}>등록자 : </Text> */}
                  <Image source={{uri : value.deliverymanImg}} 
                    PlaceholderContent={<ActivityIndicator/>}
                    containerStyle={styles.nowImg}
                  />
                  <Text style={styles.nowWriter}>{value.delivery}</Text>
              </View>
              {/* <View>
                  <Text style={styles.writerstatus}>진행중</Text>
              </View> */}
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>작성 시간 : </Text>
                  <Text style={styles.dataTxt}>{value.writeTime}</Text>
                </View>
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>승인 시간 : </Text>
                  <Text style={styles.dataTxt}>{value.deliverStart}</Text>
                </View>
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>완료 시간 : </Text>
                  <Text style={styles.dataTxt}>{value.finishTime}</Text>
                </View>
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>장소 : </Text>
                  <Text style={styles.dataTxt}>{value.place}</Text>
                </View>
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>상품 : </Text>
                  <Text style={styles.dataTxt}>{value.product}</Text>
                </View>
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>수량 : </Text>
                  <Text style={styles.dataTxt}>{value.qty}</Text>
                </View>
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>특이사항 : </Text>
                  <Text style={styles.dataTxt}>{value.remarks === '' ? '없음' : value.remarks}</Text>
                </View>
                <View style={styles.waitWriterBottom}>
                  <Image source={{uri : value.writerImg}} 
                    PlaceholderContent={<ActivityIndicator/>}
                    containerStyle={styles.userImg}
                    
                  />
                  <Text style={styles.writer}>{value.writer}</Text>
                  <Text style={styles.gray}> 작성</Text>
                </View>
              </View>
            )
          })
          :
          <View style={styles.nodata}>
             <AnimatedLottieView 
              source={require('../assets/animations/33740-sad-empty-box.json')}
              autoPlay
              loop
              style={{
                  justifyContent:'flex-start',
                  alignSelf:'center',
              }}
            />
            <Text style={styles.nodataTxt}>데이터가 없습니다.</Text>
          </View>

        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor : "#F8F8F8"
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
  calendar :{
    height : 100
  },
  finishTouch : {
    borderWidth : 1,
    borderColor : '#EEF8ED',
    borderRadius : 10,
    height : 310,
    padding : "2%",
    margin : "1%",
    backgroundColor : "white",
  },
  waitWriterBottom : {
    flexDirection : 'row',
    justifyContent : 'flex-end',
    alignItems : 'center',
    // borderBottomWidth : 1,
    marginBottom : 2,
    paddingBottom : 5,
    borderBottomColor : "#BEBEBE"
  },
  waitWriter : {
    flexDirection : 'row',
    alignItems : 'center'
  },
  gray : {
    color : '#838383',
    fontSize : 15
  },
  dataTxt : {
    fontSize : 15
  },
  writer : {
    fontSize : 16,
    fontWeight : 'bold'
  },
  userImg : {
    width : 30,
    height : 30,
    marginRight : 5,
    borderRadius : 15
  },
  waitWriterTop : {
    flexDirection : 'row',
    alignItems : 'center',
    // borderBottomWidth : 1,
    marginBottom : 2,
    paddingBottom : 5,
    borderBottomColor : "#BEBEBE"
  },
  nowImg : {
    width : 50,
    height : 50,
    borderRadius : 30,
    marginRight : 5
  },
  nowWriter : {
    fontSize : 20,
    fontWeight : 'bold'
  },
  nodata : {
    padding : '5%',
    flex : 1,
    alignItems : 'center',
    justifyContent : 'flex-start',
    height : chartHeight
  },
  nodataTxt : {
    fontSize : 20
  }
});
