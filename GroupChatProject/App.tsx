import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigators/AppNavigator';
import analytics from '@react-native-firebase/analytics';

export default function App() {
  useEffect(() => {
 
    analytics().logAppOpen();
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
