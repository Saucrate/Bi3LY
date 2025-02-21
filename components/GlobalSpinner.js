import React from 'react';
import { View, Dimensions } from 'react-native';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');

const GlobalSpinner = () => {
  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          source={require('../assets/spiner.mp4')}
          style={styles.video}
          shouldPlay={true}
          isLooping={true}
          resizeMode="contain"
          isMuted={true}
        />
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  }
};

export default GlobalSpinner; 