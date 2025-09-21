import React, { useEffect, useReducer } from 'react';

// Define the structure of props for the component
interface SatelliteVerifierProps {
  lat: number;
  lon: number;
}

// Define the structure of the API response
interface ApiResponse {
  imageUrl: string;
}

// --- State and Action Types for the Reducer ---
interface State {
  data: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ApiResponse }
  | { type: 'FETCH_ERROR'; payload: string };

// --- Reducer Function for State Management ---
const fetchReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null, data: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error('Unhandled action type');
  }
};

const SatelliteVerifier: React.FC<SatelliteVerifierProps> = ({ lat, lon }) => {
  const initialState: State = {
    data: null,
    isLoading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    // This effect runs when the component mounts and whenever `lat` or `lon` changes.
    const fetchSatelliteImage = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const apiUrl = new URL('http://localhost:3001/api/satellite/image');
        apiUrl.searchParams.append('lat', lat.toString());
        apiUrl.searchParams.append('lon', lon.toString());

        const response = await fetch(apiUrl.toString());
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const result: ApiResponse = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: result });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        dispatch({ type: 'FETCH_ERROR', payload: message });
      }
    };

    fetchSatelliteImage();
  }, [lat, lon]); // Dependency array ensures this runs when props change

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h4>Satellite Image Verification</h4>
      <p>Coordinates: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E</p>
      
      <div style={{ marginTop: '16px' }}>
        {state.isLoading && <p>Loading satellite image...</p>}
        {state.error && <p style={{ color: 'red' }}>Error: {state.error}</p>}
        {state.data && (
          <div>
            <p>Image loaded successfully.</p>
            <img 
              src={state.data.imageUrl} 
              alt={`Satellite view of ${lat}, ${lon}`} 
              style={{ maxWidth: '100%', border: '1px solid black' }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteVerifier;