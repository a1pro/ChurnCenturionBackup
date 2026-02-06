/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect} from 'react';

import {styles} from '../styles/Styles';
import {Text, View} from 'react-native';

const SplachScreen = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('Login');
    }, 3000);
  });
  return (
    <View style={styles.container}>
      <View style={{flex: 4, alignItems: 'center', justifyContent: 'center'}}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '600',
            color: 'tomato',
          }}>
          Churn
          <Text style={{color: 'green'}}> Centurion</Text>
        </Text>
      </View>
    </View>
  );
};
export default SplachScreen;
