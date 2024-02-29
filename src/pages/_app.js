import "@/styles/globals.css";
import "@aws-amplify/ui-react/styles.css";
import '../../configureAmplify';
import Navbar from "./components/navbar";

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Navbar></Navbar>
      <div className="px-16 py-8 bg-slate-100">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
