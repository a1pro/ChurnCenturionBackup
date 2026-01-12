/* eslint-disable prettier/prettier */
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Home from '../screen/Home';
import SplachScreen from '../screen/SplachScreen';
import LoginPage from '../screen/LoginPage';
import SignupPage from '../screen/SignupPage';
import CreditsPage from '../screen/CreditsPage';
import TutorialsPage from '../screen/TutorialsPage';
import TipsPage from '../screen/TipsPage';

import Splash2 from '../screen/Splash2';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="SplachScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#BAA769',
        },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen
        name="SplachScreen"
        component={SplachScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={LoginPage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Signup"
        component={SignupPage}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Credits"
        component={CreditsPage}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="Tutorials"
        component={TutorialsPage}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="Tips"
        component={TipsPage}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="Splash2"
        component={Splash2}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default Navigation;
