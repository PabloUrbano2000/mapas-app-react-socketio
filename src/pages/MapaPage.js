import React from "react";
import { SocketContext } from "../context/SocketContext";
import { useMapbox } from "../hooks/useMapbox";

const puntoInicial = {
  lng: -77.02756,
  lat: -12.0922222,
  zoom: 15,
};

export const MapaPage = () => {
  const { socket } = React.useContext(SocketContext);

  const {
    coords,
    setRef,
    nuevoMarcador$,
    movimientoMarcador$,
    agregarMarcador,
    actualizarPosicion,
  } = useMapbox(puntoInicial);

  // Escuchar los marcadores existentes
  React.useEffect(() => {
    socket.on("marcadores-activos", (marcadores) => {
      for (const key of Object.keys(marcadores)) {
        agregarMarcador(marcadores[key], key);
      }
    });
  }, [socket, agregarMarcador]);

  // Nuevo marcador
  React.useEffect(() => {
    nuevoMarcador$.subscribe((marcador) => {
      socket.emit("marcador-nuevo", marcador);
    });
  }, [nuevoMarcador$, socket]);

  // Movimiento de un marcador
  React.useEffect(() => {
    movimientoMarcador$.subscribe((marcador) => {
      socket.emit("marcador-actualizado", marcador);
    });
  }, [socket, movimientoMarcador$]);

  // Mover marcador mediante sockets
  React.useEffect(() => {
    socket.on("marcador-actualizado", (marcador) => {
      actualizarPosicion(marcador);
    });
  }, [socket, actualizarPosicion]);

  // Detectar cuando otro cliente agregó un marcador
  React.useEffect(() => {
    socket.on("marcador-nuevo", (marcador) => {
      agregarMarcador(marcador, marcador.id);
    });
  }, [socket, agregarMarcador]);
  return (
    <>
      <div className="info">
        Lng: {coords.lng} | lat: {coords.lat} | zoom: {coords.zoom}
      </div>
      <div ref={setRef} className="mapContainer" />
    </>
  );
};
