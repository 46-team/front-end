import React, { useState, useEffect } from 'react';
import Tournament from './Tournament.jsx';
import './App.css';

// Константи для статусів
const STATUS_LABELS = {
  Draft: 'Чернетка',
  Registration: 'Реєстрація',
  Running: 'Триває',
  Finished: 'Завершено'
};

function App() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [currentUser] = useState({
    full_name: "Test User",
    role: 0 // Адмін
  });

  useEffect(() => {
    // IP адреса бекенду
    fetch('http://172.30.104.10:8000/get_tournaments')
      .then((response) => {
        if (!response.ok) throw new Error('Помилка мережі');
        return response.json();
      })
      .then((data) => {
        if (data.is_ok) {
          setTournaments(data.tournaments);
        }
      })
      .catch((error) => {
        console.error("Не вдалося завантажити турніри:", error);
      });
  }, []);

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      
      {/* Ліва панель (Sidebar) */}
      <aside className="sidebar" style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px' }}>
        <div className="user-info" style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#ccc', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>T</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentUser.full_name}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Учень</div>
          </div>
        </div>
        <nav>
          <div style={{ padding: '10px', backgroundColor: '#3b82f6', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer' }}> <img src="/img/ihomepage.png" alt="icon" style={{ width: '19px', height: '19px', verticalAlign: 'middle', marginRight: '8px', marginBottom: '5px' }} /> Головна</div>
          <div style={{ padding: '10px', cursor: 'pointer' }}> <img src="/img/info.png" alt="icon" style={{ width: '19px', height: '19px', verticalAlign: 'middle', marginRight: '8px', marginBottom: '5px' }} /> Відомості</div>
          <div style={{ padding: '10px', cursor: 'pointer', marginTop: '20px' }}> <img src="/img/exit.png" alt="icon" style={{ width: '19px', height: '19px', verticalAlign: 'middle', marginRight: '8px', marginBottom: '5px' }} /> Вихід</div>
        </nav>
      </aside>

      {/* Основна частина */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '28px' }}> Головна</h1>
          <p style={{ color: '#64748b' }}>Ласкаво просимо, {currentUser.full_name.split(' ')[0]}!</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Список турнірів (використовуємо новий компонент Tournament) */}
          <section className="tournament-list">
            {tournaments.map(t => (
              <div key={t._id} onClick={() => setSelectedId(t._id)} style={{ cursor: 'pointer' }}>
                <Tournament 
                  tournament={t} 
                  onStart={(id) => console.log("Запуск турніру:", id)} 
                />
              </div>
            ))}
            {tournaments.length === 0 && <p>Турнірів поки немає...</p>}
          </section>

          {/* Детальна інформація */}
          <section className="details-section">
            {selectedId ? (
              <TournamentDetails 
                tournament={tournaments.find(t => t._id === selectedId)} 
                currentUser={currentUser}
              />
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '12px' }}>
                Оберіть турнір зі списку для перегляду деталей
              </div>
            )}
          </section>
        </div>

        <footer style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          Розробник: Павло П. © 2026. Всі права захищені.
        </footer>
      </main>
    </div>
  );
}

// Компонент деталей
function TournamentDetails({ tournament, currentUser }) {
  if (!tournament) return null;

  const isAdmin = currentUser && currentUser.role === 0;

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{tournament.title}</h2>
        {isAdmin && (
          <button style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
            ⚙️ Редагувати
          </button>
        )}
      </div>

      <p style={{ color: '#475569', lineHeight: '1.6' }}>{tournament.description}</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>📅 Початок:</strong> {new Date(tournament.start_date * 1000).toLocaleString('uk-UA')}
        </div>
        <div>
          <strong>🏁 Завершення:</strong> {new Date(tournament.end_date * 1000).toLocaleString('uk-UA')}
        </div>
      </div>
      
      <button 
        style={{
          marginTop: '25px',
          width: '100%',
          padding: '12px',
          backgroundColor: tournament.status === 'Registration' ? '#3b82f6' : '#cbd5e1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: tournament.status === 'Registration' ? 'pointer' : 'not-allowed'
        }}
        disabled={tournament.status !== 'Registration'}
      >
        {tournament.status === 'Registration' ? 'Підтвердити участь' : 'Реєстрація недоступна'}
      </button>
    </div>
  );
}

export default App;