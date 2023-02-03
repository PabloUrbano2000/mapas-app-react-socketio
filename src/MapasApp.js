import { SocketProvider } from "./context/SocketContext";
import { MapaPage } from "./pages/MapaPage";

function MapsApp() {
  return (
    <SocketProvider>
      <MapaPage></MapaPage>
    </SocketProvider>
  );
}

export default MapsApp;
