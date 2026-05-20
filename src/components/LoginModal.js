import React from 'react';

export default function LoginModal({ 
  usuarioInput, setUsuarioInput, 
  passwordInput, setPasswordInput, 
  procesarLogin, setMostrandoLogin, styles 
}) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCard}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', textAlign: 'center' }}>🔑 Panel de Control</h3>
        <form onSubmit={procesarLogin} style={styles.form}>
          <input 
            type="text" 
            placeholder="Usuario (admin)" 
            value={usuarioInput}
            onChange={(e) => setUsuarioInput(e.target.value)}
            style={styles.input}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña (123)" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.buttonSave}>Entrar al Sistema</button>
          <button 
            type="button" 
            onClick={() => setMostrandoLogin(false)} 
            style={{ ...styles.buttonCancel, padding: '10px', marginTop: '5px' }}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}