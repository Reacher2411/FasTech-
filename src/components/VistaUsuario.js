import React, { useState } from 'react';

export default function VistaUsuario({ productosFiltrados, busqueda, setBusqueda, cargando, styles }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const [nombreCliente, setNombreCliente] = useState('');
  const [procesando, setProcesando] = useState(false);

  const API_PEDIDOS = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/pedidos'
    : 'http://192.168.1.193:5000/pedidos';

  const enviarPedido = (e) => {
    e.preventDefault();
    if (!nombreCliente.trim()) return;

    setProcesando(true);

    // Si el navegador no tiene soporte de geolocalización, envía directo sin coordenadas
    if (!navigator.geolocation) {
      procesarCompraFinal(0, 0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // SI EL GPS RESPONDE CORRECTAMENTE
        procesarCompraFinal(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // SI EL GPS DA ERROR O ESTÁ BLOQUEADO POR EL NAVEGADOR
        console.log("GPS no disponible. Registrando pedido en coordenadas de respaldo.");
        procesarCompraFinal(0, 0); 
      },
      { enableHighAccuracy: false, timeout: 4000 } // Espera máxima de 4 segundos antes de saltar al respaldo
    );
  };

  const procesarCompraFinal = async (lat, lng) => {
    const nuevoPedido = {
      nombre_cliente: nombreCliente.trim(),
      producto_id: seleccionado.id,
      nombre_producto: seleccionado.nombre,
      precio: seleccionado.precio,
      latitud: lat,
      longitud: lng
    };

    try {
      const res = await fetch(API_PEDIDOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPedido)
      });
      if (res.ok) {
        alert(`🛒 ¡Pedido enviado con éxito, ${nombreCliente}!`);
        setSeleccionado(null);
        setNombreCliente('');
        window.location.reload(); // Recarga para actualizar las existencias en pantalla
      } else {
        alert("El servidor no pudo procesar la solicitud.");
      }
    } catch (err) {
      alert('Error de red al conectar con el backend.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>Catálogo Tecnológico</h2>
          <p style={styles.sectionSubtitle}>Explora e indica tu ubicación para envíos a domicilio</p>
        </div>
        <input type="text" placeholder="🔍 Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={styles.searchInput} />
      </div>

      {/* FORMULARIO EMERGENTE DE PEDIDO */}
      {seleccionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>📍 Formulario de Entrega</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Comprando: <strong>{seleccionado.nombre}</strong> por <strong>${seleccionado.precio}</strong>
            </p>
            <form onSubmit={enviarPedido} style={styles.form}>
              <input 
                type="text" 
                placeholder="Tu Nombre Completo" 
                value={nombreCliente} 
                onChange={(e) => setNombreCliente(e.target.value)} 
                style={styles.input} 
                required 
              />
              <p style={{ fontSize: '11px', color: '#2563eb', margin: '0' }}>
                ℹ El sistema intentará capturar tu ubicación en tiempo real para optimizar la logística de entrega.
              </p>
              <button type="submit" disabled={procesando} style={styles.buttonSave}>
                {procesando ? 'Procesando Solicitud...' : 'Confirmar Pedido '}
              </button>
              <button type="button" onClick={() => setSeleccionado(null)} style={styles.buttonCancel}>Cerrar</button>
            </form>
          </div>
        </div>
      )}

      {/* RENDERIZADO DEL INVENTARIO */}
      {cargando ? (
        <div style={styles.centerText}>Cargando catálogo...</div>
      ) : productosFiltrados.length === 0 ? (
        <div style={styles.noProducts}>No hay artículos disponibles por el momento.</div>
      ) : (
        <div style={styles.gridStore}>
          {productosFiltrados.map((p) => (
            <div key={p.id} style={styles.storeCard}>
              <div style={styles.imageWrapper}><img src={p.imagen} alt="" style={styles.productImage} /></div>
              <div style={styles.cardBody}>
                <h3 style={styles.productName}>{p.nombre}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                  <span style={styles.priceTag}>${parseFloat(p.precio).toFixed(2)}</span>
                  <span style={p.stock > 0 ? styles.stockBadgeIn : styles.stockBadgeOut}>Stock: {p.stock}</span>
                </div>
                {p.stock > 0 ? (
                  <button onClick={() => setSeleccionado(p)} style={styles.buttonOrder}>🛒 Ordenar Ahora</button>
                ) : (
                  <button disabled style={styles.buttonDisabled}>Agotado</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}