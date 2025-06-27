import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components';
import { 
  Login, 
  Register, 
  Profile, 
  Posts, 
  CreateTrainingSession,
  MyTrainingSessions,
  TrainingSessionDetails
} from './pages';
import { ExerciseConstructor } from './pages/ExerciseConstructor';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exerciseConstructor" element={<ExerciseConstructor/>}/>
          <Route
            path="/create-training-session"
            element={
              <ProtectedRoute>
                <CreateTrainingSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-training-sessions"
            element={
              <ProtectedRoute>
                <MyTrainingSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-session/:id"
            element={
              <ProtectedRoute>
                <TrainingSessionDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
            <Route path="/posts">
                <Route index element={<Posts />} />
                <Route path=":id" element={<Posts />} />
            </Route>
            <Route path="/" element={<Navigate to="/profile" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
