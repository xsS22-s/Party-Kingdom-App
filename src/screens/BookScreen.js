import React from 'react';
import LilyPadWebView from '../components/LilyPadWebView';

// Same hosted form used by Party Kingdom's website. LilyPad handles all
// input, submission, storage, and confirmation; the app only displays it.
const LILYPAD_URL = 'https://partykingdom.lilypadpos.app/public/onlinebooking/step1.php';

export default function BookScreen({ navigation }) {
  return (
    <LilyPadWebView
      source={LILYPAD_URL}
      title="Book a Party"
      onClose={() => navigation.navigate('Home')}
    />
  );
}
