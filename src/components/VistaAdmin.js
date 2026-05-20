import React, { useEffect, useState } from 'react';

export default function VistaAdmin({
  agregarProducto, nombre, setNombre, precio, setPrecio, stock, setStock, manejarArchivoImagen,
  busqueda, setBusqueda, cargando, productosFiltrados, idEditando, setIdEditando,
  nombreEditado, setNombreEditado, precioEditado, setPrecioEditado, stockEditado, setStockEditado,
  guardarEdicion, activarEdicion, borrarProducto, styles
}) {
  const [pedidos, setPedidos] = useState([]);

  const API_VER_PEDIDOS = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/pedidos'
    : 'http://192.168.1.193:5000/pedidos';

  // Cargar las hojas de ruta desde el backend al abrir el panel
  const cargarPedidos = () => {
    fetch(API_VER_PEDIDOS)
      .then(res => res.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error al cargar pedidos en admin:", err));
  };

  useEffect(() => {
    cargarPedidos();
  }, [API_VER_PEDIDOS]);

  // Función para descartar/eliminar un pedido completado
  const eliminarPedido = async (id) => {
    if (!window.confirm("¿Estás seguro de descartar este pedido de la lista?")) return;

    try {
      const res = await fetch(`${API_VER_PEDIDOS}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Remueve el pedido de la pantalla inmediatamente sin recargar
        setPedidos(pedidos.filter(p => p.id !== id));
      } else {
        alert("No se pudo eliminar el pedido en el servidor.");
      }
    } catch (err) {
      console.error("Error de red al descartar pedido:", err);
      alert("Error de red al conectar con el backend.");
    }
  };

  return (
    <div>
      {/* 1. SECCIÓN: AÑADIR NUEVO HARDWARE AL INVENTARIO */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}> Panel de Control: Añadir Nuevo Dispositivo</h3>
        <form onSubmit={agregarProducto} style={styles.form}>
          <div style={styles.inputGroupGrid}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={styles.input} required />
            <input type="number" step="0.01" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} style={styles.input} required />
            <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={styles.input} required />
          </div>
          <input type="file" accept="image/*" onChange={(e) => manejarArchivoImagen(e, false)} style={styles.fileInput} />
          <button type="submit" style={styles.buttonSave}>Subir al Catálogo de MySQL</button>
        </form>
      </div>

      {/* 2. SECCIÓN: BANDEJA DE HOJAS DE RUTA (CON LOGÍSTICA MAPS Y DESCARTE DE PEDIDOS) */}
      <div style={{ ...styles.card, borderLeft: '6px solid #10b981' }}>
        <h3 style={{ ...styles.cardTitleNoMargin, marginBottom: '15px', color: '#0f172a' }}>📥 Hojas de Ruta Pendientes (Entregas GPS)</h3>
        {pedidos.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '14px' }}>No hay solicitudes de envío registradas en el sistema.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Destinatario</th>
                  <th style={styles.th}>Hardware</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Logística e Intervención</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} style={styles.tableRow}>
                    <td style={styles.td}><strong>{p.nombre_cliente}</strong></td>
                    <td style={styles.td}>{p.nombre_producto}</td>
                    <td style={styles.td}>${parseFloat(p.precio).toFixed(2)}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* URL DE BÚSQUEDA PÚBLICA OFICIAL DE GOOGLE MAPS */}
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${p.latitud},${p.longitud}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ 
                            background: '#10b981', 
                            color: 'white', 
                            textDecoration: 'none', 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}
                        >
                           Ver en Google Maps
                        </a>

                        {/* BOTÓN AGREGADO PARA ACCIÓN DE ELIMINAR PEDIDO */}
                        <button 
                          onClick={() => eliminarPedido(p.id)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                           Descartar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. SECCIÓN: TABLA DE CONTROL DE EXISTENCIAS */}
      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.cardTitleNoMargin}> Inventario de Existencias</h3>
          <input type="text" placeholder="🔍 Filtrar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ ...styles.searchInput, width: '200px', padding: '8px 12px' }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Foto</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id} style={styles.tableRow}>
                  <td style={styles.td}><img src={p.imagen} alt="" style={styles.thumbnail} /></td>
                  <td style={styles.td}>
                    {idEditando === p.id ? <input type="text" value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} style={styles.inputTable} /> : p.nombre}
                  </td>
                  <td style={styles.td}>
                    {idEditando === p.id ? <input type="number" step="0.01" value={precioEditado} onChange={(e) => setPrecioEditado(e.target.value)} style={styles.inputTable} /> : `$${parseFloat(p.precio).toFixed(2)}`}
                  </td>
                  <td style={styles.td}>
                    {idEditando === p.id ? <input type="number" value={stockEditado} onChange={(e) => setStockEditado(e.target.value)} style={styles.inputTable} /> : p.stock}
                  </td>
                  <td style={styles.td}>
                    {idEditando === p.id ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => guardarEdicion(p.id)} style={styles.buttonSaveSmall}>OK</button>
                        <button onClick={() => setIdEditando(null)} style={styles.buttonCancel}>X</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => activarEdicion(p)} style={styles.buttonEdit}>Editar</button>
                        <button onClick={() => borrarProducto(p.id)} style={styles.buttonDelete}>Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}