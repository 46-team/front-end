import React from 'react';

/**
 * Компонент для відображення детальної інформації про обраний турнір.
 * @param {Object} tournament - Об'єкт турніру з бекенду
 * @param {Object} currentUser - Об'єкт поточного користувача (з роллю та ім'ям)
 */
function TournamentDetails({ tournament, currentUser }) {
  // Якщо турнір не обраний, компонент нічого не рендерить
  if (!tournament) return null;

  const isAdmin = currentUser && currentUser.role === 0;
  const isRegistrationOpen = tournament.status === 'Registration';

  // Форматування дат для відображення
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '30px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Шапка деталей */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b' }}>
          {tournament.title}
        </h2>
        
        {isAdmin && (
          <button 
            onClick={() => console.log("Редагування турніру:", tournament._id)}
            style={{ 
              backgroundColor: '#f59e0b', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚙️</span> Редагувати
          </button>
        )}
      </div>

      {/* Опис */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ color: '#64748b', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>
          Опис турніру
        </h4>
        <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>
          {tournament.description || "Опис відсутній."}
        </p>
      </div>
      
      {/* Часові рамки */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px',
        padding: '20px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '10px',
        marginBottom: '25px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Початок</div>
          <div style={{ fontWeight: '600', color: '#334155' }}>
            {formatDate(tournament.start_date)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Завершення</div>
          <div style={{ fontWeight: '600', color: '#334155' }}>
            {formatDate(tournament.end_date)}
          </div>
        </div>
      </div>
      
      {/* Кнопка дії */}
      <button 
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: isRegistrationOpen ? '#3b82f6' : '#cbd5e1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isRegistrationOpen ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.2s'
        }}
        disabled={!isRegistrationOpen}
        onClick={() => alert(`Ви зареєструвалися на ${tournament.title}`)}
      >
        {isRegistrationOpen ? 'Підтвердити участь у турнірі' : 'Реєстрація закрита'}
      </button>

      {/* Додаткова інформація */}
      {!isRegistrationOpen && (
        <p style={{ 
          textAlign: 'center', 
          fontSize: '13px', 
          color: '#94a3b8', 
          marginTop: '12px' 
        }}>
          * Ви зможете приєднатися, коли статус зміниться на "Реєстрація"
        </p>
      )}
    </div>
  );
}

export default TournamentDetails;