import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Perfil } from './pages/Perfil'; 
import { ThreadDetails } from './pages/ThreadDetails';
import { Definicoes } from './pages/Definicoes';

const RotaProtegida = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RotaProtegida />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} /> 
            <Route path="perfil" element={<Perfil />} />
            <Route path="threads/:id" element={<ThreadDetails />} />
            <Route path="definicoes" element={<Definicoes />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;