import React, { useState, useEffect } from 'react';
import Tournament from '../Tournament'; // Перевірте шлях до файлу
import '../App.css';
import TournamentDetails from '../components/TournamentDetails';

export function Dashboard () {
    const user = JSON.parse(localStorage.getItem("usr_acc")) || {
        first_name: "Unknown",
        last_name: "User",
        role: "Unknown role"
    };
    return (
        <>logged in<br/> {JSON.stringify(user, null, 2)}</>
    );
}

export default function MainContainer({ setPage }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [currentUser] = useState({
    full_name: "Test User",
    role: 0 
  });

  useEffect(() => {
    fetch('http://172.30.104.10:8000/get_tournaments')
      .then((res) => res.json())
      .then((data) => {
        if (data.is_ok) setTournaments(data.tournaments);
      })
      .catch((err) => console.error("Помилка завантаження:", err));
  }, []);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar">T</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentUser.full_name}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Учень</div>
          </div>
        </div>
        <nav>
          <div className="nav-item active">Головна</div>
          <div className="nav-item">Відомості</div>
          {/* Кнопка виходу використовує setPage колеги */}
          <div className="nav-item logout" onClick={() => setPage("auth")}>Вихід</div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>Головна</h1>
          <p>Ласкаво просимо, {currentUser.full_name.split(' ')[0]}!</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <section className="tournament-list">
            {tournaments.map(t => (
              <div key={t._id} onClick={() => setSelectedId(t._id)} style={{ cursor: 'pointer' }}>
                <Tournament 
                  tournament={t} 
                  onStart={(id) => console.log("Запуск:", id)} 
                />
              </div>
            ))}
          </section>

          <section className="details-section">
            {selectedId ? (
              <TournamentDetails 
                tournament={tournaments.find(t => t._id === selectedId)} 
              />
            ) : (
              <div className="empty-selection">Оберіть турнір для перегляду</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}