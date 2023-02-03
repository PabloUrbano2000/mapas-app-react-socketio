import React, { useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { v4 } from "uuid";
import { Subject } from "rxjs";

mapboxgl.accessToken =
  "pk.eyJ1IjoicGFibG9lbG1hbGR5IiwiYSI6ImNsYjZubGRteDAydDUzdnA1M3pmaDk0OTQifQ.5eGyWk5c0T_4F-G9U4sqiQ";

export const useMapbox = (puntoInicial) => {
  //Referencia al DIV del mapa
  const mapaDiv = React.useRef();
  const setRef = useCallback((node) => {
    mapaDiv.current = node;
  }, []);
  // Refencia de los marcadores

  const marcadores = React.useRef({});

  // Observables de Rxxjs
  const movimientoMarcador = React.useRef(new Subject());
  const nuevoMarcador = React.useRef(new Subject());

  // Mapa y coords
  const mapa = React.useRef();
  const [coords, setCoords] = React.useState(puntoInicial);

  // Función para agregar marcadores
  const agregarMarcador = useCallback((ev, id) => {
    const { lng, lat } = ev.lngLat || ev || {};
    const marker = new mapboxgl.Marker();
    marker.id = id ?? v4(); //TODO si el marcador ya tiene ID

    marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(true);

    marcadores.current[marker.id] = marker;

    // Si elmarcador tiene ID no emitir
    if (!id) {
      nuevoMarcador.current.next({
        id: marker.id,
        lng,
        lat,
      });
    }

    // escuchar movimientos del marcador
    marker.on("drag", (ev) => {
      const { id } = ev.target;
      const { lng, lat } = ev.target.getLngLat();

      // TODO: emitir los cambios del marcador
      movimientoMarcador.current.next({
        id,
        lng,
        lat,
      });
    });
  }, []);

  // Función para actualizar la ubicación del marcador
  const actualizarPosicion = useCallback((marcador) => {
    const { id, lng, lat } = marcador || {};
    marcadores.current[id].setLngLat({ lng, lat });
  }, []);

  React.useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [puntoInicial.lng, puntoInicial.lat],
      zoom: puntoInicial.zoom,
    });

    mapa.current = map;
  }, [puntoInicial]);

  // cuando se mueva el mapa
  React.useEffect(() => {
    mapa?.current?.on("move", () => {
      const { lng, lat } = mapa?.current?.getCenter();
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapa?.current?.getZoom().toFixed(2),
      });
    });
    return mapa?.current?.off("move");
  }, []);

  //creando marcador
  React.useEffect(() => {
    mapa?.current?.on("click", agregarMarcador);
  }, [agregarMarcador]);
  return {
    agregarMarcador,
    actualizarPosicion,
    coords,
    marcadores,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    setRef,
  };
};
