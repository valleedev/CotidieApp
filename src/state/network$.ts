import { observable } from '@legendapp/state';
import NetInfo from '@react-native-community/netinfo';

export const isOnline$ = observable(true);

NetInfo.addEventListener((state) => {
  isOnline$.set(state.isConnected !== false && state.isInternetReachable !== false);
});
