import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { RootTabScreenProps } from '../types';
import { useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { useEffect } from 'react';
import { getDatabase, onValue, push, ref, remove, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Image } from '@rneui/themed';
import moment from 'moment';
import LoadingAnimation from '../components/Loading';
import AnimatedLottieView from 'lottie-react-native';

const chartHeight = Dimensions.get('window').height;
const chartWidth = Dimensions.get('window').width;


export default function TabTwoScreen({ navigation }: RootTabScreenProps<'TabTwo'>) {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key : 'first', title : '대기중' },
    { key : 'second', title : '진행중' },
    { key : 'third', title : '완료' }
  ])
  const [todayTxt, setTodayTxt] = useState<string>(moment(new Date()).format('YYYYMMDD'));

  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [teamName, setTeamName] = useState<string>('');

  const [listdata, setListdata] = useState<Array<any>>(null);
  const [listkey, setListKey] = useState<string[]>([]);

  const [listdata2, setListdata2] = useState<Array<any>>(null);
  const [listkey2, setListKey2] = useState<string[]>([]);

  const [listdata3, setListdata3] = useState<Array<any>>([]);
  const [listkey3, setListKey3] = useState<string[]>([]);

  const [currentUser, setCurrentUser] = useState<string | null | undefined>('');
  const [currentUserImg, setCurrentUserImg] = useState<string | null | undefined>('');

  // const [lottie1, setLottie1] = useState<boolean>(false);
  // const [lottie2, setLottie2] = useState<boolean>(false);
  // const [lottie3, setLottie3] = useState<boolean>(false);

  useEffect(() => {
    const today = moment(new Date()).format('YYYYMMDD');
    setTodayTxt(today);

    const auth = getAuth();
    const user = auth.currentUser;  
    setCurrentUser(user?.displayName);
    setCurrentUserImg(user?.photoURL);

    const db = getDatabase();
    const list = ref(db, 'member/'+user?.uid);
    onValue(list, (snapshot) => {
      const data = snapshot.val();
      setTeamName(data.teamname);
    }, {
      onlyOnce:true
    })

    const starCountRef = ref(db, 'work/'+teamName+'/'+ todayTxt +'/wait');
    onValue(starCountRef, (snapshot) => {
      try {
        if(snapshot.exists()){
          const data2 = snapshot.val();
          setListdata(Object.values(data2));
          setListKey(Object.keys(data2));
          // console.log('listdata',listdata);
          // console.log('keys', listkey);
        }else{
          // console.log('work/'+teamName+'/' + todayTxt + '/wait','no data');
          setListdata(null);
          setListKey(null);
        }
      } catch (error) {
        console.error(error);
      }
    });

    const nowRef = ref(db, 'work/'+teamName+'/'+todayTxt+'/now');
    onValue(nowRef, (snapshot) => {
      try {
        // console.log('snapshot',snapshot.val());
        if(snapshot.exists()){
          const data2 = snapshot.val();
          setListdata2(Object.values(data2));
          setListKey2(Object.keys(data2));
          // console.log('listdata',listdata);
          // console.log('keys', listkey);
        }else{
          // console.log('work/'+teamName+'/'+todayTxt+'/now','no data');
          setListdata2(null);
          setListKey2(null);
        }
      } catch (error) {
        console.error(error);
      }
    });

    const finishRef = ref(db, 'work/'+teamName+'/'+todayTxt+'/finish');
    onValue(finishRef, (snapshot) => {
      try {
        // console.log('snapshot',snapshot.val());
        if(snapshot.exists()){
          const data2 = snapshot.val();
          setListdata3(Object.values(data2));
          setListKey3(Object.keys(data2));
          // console.log('listdata',listdata);
          // console.log('keys', listkey);
        }else{
          // console.log('work/'+teamName+'/'+todayTxt+'/finish','no data');
          setListdata3(null);
          setListKey3(null);
        }
      } catch (error) {
        console.error(error);
      }
    });

    // if(index === 1){
    //   setLottie1(true);
    //   setLottie2(false);
    //   setLottie3(false);
    // }else if(index === 2){
    //   setLottie2(true);
    //   setLottie1(false);
    //   setLottie3(false);
    // }else if(index === 3){
    //   setLottie3(true);
    //   setLottie1(false);
    //   setLottie2(false);
    // }
    
    return () => setIsUpdate(false);
    
  },[teamName, routes, isUpdate])

  const FirstRoute = () => {
    const alert = (value : any, i : number) => {
      Alert.alert(
        "배달",
        "배달하시겠습니까?",
        [
          {
          text : "네",
          onPress: ()=> {
            setIsLoading(true);
            setIsUpdate(true);
            const deliverStart = moment(new Date()).format('hh시 mm분 ss초');
            const db = getDatabase();
            const postListRef = ref(db, 'work/'+teamName+'/'+todayTxt+'/now');
            const newPostRef = push(postListRef);
            set(newPostRef,{
              place : value.place,
              writer : value.writer,
              writerUid : value.writerUid,
              writerImg : value.writerImg,
              writeTime : value.writeTime,
              product : value.product,
              qty : value.qty,
              remarks : value.remarks,
              delivery : currentUser,
              deliverymanImg : currentUserImg,
              deliverStart : deliverStart
            }).then(() => {
              remove(ref(db,'work/'+teamName+'/'+todayTxt+'/wait/'+listkey[i]));
            }).then(() => {
              setIsUpdate(false);
              setIsLoading(false);
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
      <>  
      {
          isLoading === true ? 
          <LoadingAnimation/>
          :
          <View></View>
        }
      <ScrollView style={styles.container}>
        {
          listdata !==  null ? 
          listdata?.map((value, i)=>{
            return(
              <TouchableOpacity key={i}
                style={styles.waitTouch}
                onPress={() => alert(value, i)}
              >
                <View style={styles.waitWriterTop}>
                  {/* <Text style={styles.gray}>등록자 : </Text> */}
                  <Image source={{uri : value.writerImg}} 
                    PlaceholderContent={<ActivityIndicator/>}
                    containerStyle={styles.userImg}
                  />
                  <Text style={styles.writer}>{value.writer}</Text>
                </View>
                <View style={styles.waitWriter}>
                  <Text style={styles.gray}>작성 시간 : </Text>
                  <Text style={styles.dataTxt}>{value.writeTime}</Text>
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
               
              </TouchableOpacity>
            )
          })
          :
          <View style={styles.nodata}>
             <AnimatedLottieView 
              source={require('../assets/animations/78075-box-prepare.json')}
              autoPlay
              loop
              style={{
                  justifyContent:'flex-start',
                  alignSelf:'center',
              }}
            />
            <Text style={styles.nodataTxt}>대기중인 물품이 없습니다.</Text>
          </View>
        }
      </ScrollView>
      </>
    )
  }

  const SecondRoute = () => {
    const overBtn = (value : any, i : number) => {
      if(value.delivery === currentUser){
        Alert.alert(
          "완료",
          "완료하시겠습니까?",
          [
            {
              text : '네',
              onPress : () => {
                setIsLoading(true);
                setIsUpdate(true);
                const finishTime = moment(new Date()).format('hh시 mm분 ss초');
                const db = getDatabase();
                const postListRef = ref(db, 'work/'+teamName+'/'+todayTxt+'/finish');
                const newPostRef = push(postListRef);
                set(newPostRef,{
                  place : value.place,
                  writer : value.writer,
                  writerUid : value.writerUid,
                  writerImg : value.writerImg,
                  writeTime : value.writeTime,
                  product : value.product,
                  qty : value.qty,
                  remarks : value.remarks,
                  delivery : value.delivery,
                  deliverymanImg : value.deliverymanImg,
                  deliverStart : value.deliverStart,
                  finishTime : finishTime
                }).then(() => {
                  remove(ref(db,'work/'+teamName+'/'+todayTxt+'/now/'+listkey2[i]));
                }).then(() => {
                  setIsUpdate(false);
                  setIsLoading(false);
                })
              }
            },
            {
              text : '아니오',
              onPress : () => null
            }
          ]
        )
      }else{
        Alert.alert(
          "알림",
          "본인만 완료할 수 있습니다."
        )
      }
     
    }

    return (
      <>
      {
        isLoading === true ? 
        <LoadingAnimation/>
        :
        <View></View>
      }
      <ScrollView style={styles.container}>
       
        {
          listdata2 !== null ? 
          listdata2.map((value, i) => {
            return(
              <TouchableOpacity key={i}
                style={styles.nowTouch}
                onPress={() => overBtn(value, i)}
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
              </TouchableOpacity>
            )
          })
          :
          <View style={styles.nodata}>
             <AnimatedLottieView 
              source={require('../assets/animations/3075-delivery-van.json')}
              autoPlay
              loop
              style={{
                  justifyContent:'flex-start',
                  alignSelf:'center',
              }}
            />
            <Text style={styles.nodataTxt}>진행중인 물품이 없습니다.</Text>
          </View>

        }
      </ScrollView>
      </>
    )
  }

  const ThirdRoute = () => {
    return (
      <ScrollView style={styles.container}>
        {
          listdata3 !== null ? 
          listdata3.map((value, i) => {
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
              source={require('../assets/animations/23211-receive-order.json')}
              autoPlay
              loop
              style={{
                  justifyContent:'flex-start',
                  alignSelf:'center',
              }}
            />
            <Text style={styles.nodataTxt}>완료된 물품이 없습니다.</Text>
          </View>

        }
      </ScrollView>
    )
  }

  const renderScene = SceneMap({
    first : FirstRoute,
    second : SecondRoute,
    third : ThirdRoute,
  })

  return (
    <TabView 
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width : layout.width}}
      renderTabBar={props => (
        <TabBar 
          {...props}
          activeColor={"black"}
          style={{
            // backgroundColor: "white",
            shadowOffset: { height: 0, width: 0 },
            shadowColor: "transparent",
            backgroundColor : 'white',
          }}
          indicatorStyle={{backgroundColor : 'black'}}
          labelStyle={{color : '#BDBDBD'}}
        />
      )}
      style={{
        
      }}
    />
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
  waitTouch :{
    borderWidth : 1,
    borderColor : '#EEF8ED',
    borderRadius : 10,
    height : 200,
    padding : "2%",
    margin : "1%",
    backgroundColor : "white",
  },
  userImg : {
    width : 30,
    height : 30,
    marginRight : 5,
    borderRadius : 15
  },
  nowImg : {
    width : 50,
    height : 50,
    borderRadius : 30,
    marginRight : 5
  },
  waitWriter : {
    flexDirection : 'row',
    alignItems : 'center'
  },
  nowWriter : {
    fontSize : 20,
    fontWeight : 'bold'
  },
  waitWriterTop : {
    flexDirection : 'row',
    alignItems : 'center',
    // borderBottomWidth : 1,
    marginBottom : 2,
    paddingBottom : 5,
    borderBottomColor : "#BEBEBE"
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
  nowTouch : {
    borderWidth : 1,
    borderColor : '#EEF8ED',
    borderRadius : 10,
    height : 300,
    padding : "2%",
    margin : "1%",
    backgroundColor : "white",
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
  writerstatus : {
    textAlign : 'right'
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
