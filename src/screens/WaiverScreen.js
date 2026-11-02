import React from 'react';
import LilyPadWebView from '../components/LilyPadWebView';

// Same hosted form used by Party Kingdom's website. LilyPad handles all
// input, submission, storage, and confirmation; the app only displays it.
const LILYPAD_URL = 'https://partykingdom.lilypadpos.app/public/onlinewaiver/waiver.php';

export default function WaiverScreen({ navigation }) {
  return (
    <LilyPadWebView
      source={LILYPAD_URL}
      title="Sign a Waiver"
      onClose={() => navigation.navigate('Home')}
    />
  );
}
