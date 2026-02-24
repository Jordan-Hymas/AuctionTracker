import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuctionProvider } from './context/AuctionContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Display from './pages/Display';
import Control from './pages/Control';
import MobileControl from './pages/MobileControl';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuctionProvider>
          <Routes>
            <Route path="/" element={<Display />} />
            <Route path="/control" element={<Control />} />
            <Route path="/mobile" element={<MobileControl />} />
          </Routes>
        </AuctionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
