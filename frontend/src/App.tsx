import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuctionProvider } from './context/AuctionContext';
import Display from './pages/Display';
import Control from './pages/Control';
import MobileControl from './pages/MobileControl';

function App() {
  return (
    <BrowserRouter>
      <AuctionProvider>
        <Routes>
          <Route path="/" element={<Display />} />
          <Route path="/control" element={<Control />} />
          <Route path="/mobile" element={<MobileControl />} />
        </Routes>
      </AuctionProvider>
    </BrowserRouter>
  );
}

export default App;
