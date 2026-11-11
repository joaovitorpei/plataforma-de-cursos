// StatusBar do Expo controla a barra de status (hora, bateria) do celular
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';

// Por enquanto o app tem só a tela de Login.
// A navegação (React Navigation) entra na próxima etapa.
export default function App() {
  return (
    <>
      <LoginScreen />
      <StatusBar style="dark" />
    </>
  );
}
