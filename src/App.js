import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [pantalla, setPantalla] = useState('tienda');
  const [pestanaAdmin, setPestanaAdmin] = useState('pedidos');

  // Formularios de administración
  const [passwordInput, setPasswordInput] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null);

  // Estados temporales para edición en tabla
  const [preciosEditados, setPreciosEditados] = useState({});
  const [stocksEditados, setStocksEditados] = useState({});

  const cargarProductos = () => {
    fetch('http://localhost:5000/api/productos')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error(err));
  };

  const cargarPedidos = () => {
    fetch('http://localhost:5000/api/pedidos')
      .then((res) => res.json())
      .then((data) => setPedidos(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarProductos();
    cargarPedidos();
  }, []);

  const ejecutarLogin = (e) => {
    e.preventDefault();
    if (passwordInput === "admin123") {
      setPantalla('admin');
      setPasswordInput('');
    } else {
      alert("❌ Contraseña incorrecta.");
    }
  };

  const crearPedido = (producto) => {
    const nombre = prompt("Ingresa tu nombre para el pedido:");
    if (!nombre) return;
    const telefono = prompt("Ingresa tu número telefónico:");
    if (!telefono) return;

    const pedidoObj = {
      nombre_cliente: `${nombre} (Tel: ${telefono})`,
      nombre_producto: producto.nombre,
      precio: producto.precio,
      latitud: 0,
      longitud: 0
    };

    fetch('http://localhost:5000/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoObj)
    })
      .then(() => {
        alert("¡Pedido realizado con éxito!");
        cargarPedidos();
      });
  };

  const eliminarPedido = (id) => {
    if (window.confirm("¿Deseas descartar este pedido?")) {
      fetch(`http://localhost:5000/api/pedidos/${id}`, { method: 'DELETE' })
        .then(() => cargarPedidos());
    }
  };

  // Guardar un nuevo artículo con foto en MariaDB
  const agregarProducto = (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoPrecio || !nuevoStock) return;

    const formData = new FormData();
    formData.append('nombre', nuevoNombre);
    formData.append('precio', nuevoPrecio);
    formData.append('stock', nuevoStock);
    if (imagenArchivo) {
      formData.append('imagen', imagenArchivo);
    }

    fetch('http://localhost:5000/api/productos', {
      method: 'POST',
      body: formData
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en servidor");
        return res.json();
      })
      .then(() => {
        alert("¡Artículo guardado exitosamente en MariaDB!");
        setNuevoNombre('');
        setNuevoPrecio('');
        setNuevoStock('');
        setImagenArchivo(null);
        cargarProductos();
      })
      .catch(() => alert("Error al intentar guardar el producto."));
  };

  // Actualizar precio/stock editados en la tabla
  const actualizarProductoEnDB = (id, precioOriginal, stockOriginal) => {
    const precioFinal = preciosEditados[id] !== undefined ? preciosEditados[id] : precioOriginal;
    const stockFinal = stocksEditados[id] !== undefined ? stocksEditados[id] : stockOriginal;

    fetch(`http://localhost:5000/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ precio: precioFinal, stock: stockFinal })
    })
      .then(() => {
        alert("¡Cambios actualizados en MariaDB!");
        cargarProductos();
      })
      .catch(() => alert("Error al actualizar."));
  };

  // 🔥 Función conectada para borrar sin errores de servidor
  const eliminarProductoCompleto = (id) => {
    if (window.confirm("⚠️ ¿Estás completamente seguro de borrar este producto?")) {
      fetch(`http://localhost:5000/api/productos/${id}`, {
        method: 'DELETE'
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error en la petición");
          return res.json();
        })
        .then(() => {
          alert("Producto eliminado de MariaDB.");
          cargarProductos(); // Refresca la lista en vivo
        })
        .catch(() => alert("No se pudo eliminar el artículo. Asegúrate de reiniciar el backend."));
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="App">
      <header className="navbar">
        <div className="container nav-container">
          <h1 className="logo" onClick={() => setPantalla('tienda')}>FasTech ⚡</h1>
          {pantalla === 'tienda' ? (
            <button className="btn btn-primary" onClick={() => setPantalla('login')}>🔑 Panel Admin</button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setPantalla('tienda')}>🛒 Ver Catálogo</button>
          )}
        </div>
      </header>

      <main className="container content-wrapper">
        {pantalla === 'tienda' && (
          <>
            <div className="section-header">
              <div>
                <h2>Catálogo Tecnológico</h2>
                <p>Equipos premium con entrega directa.</p>
              </div>
              <div className="search-bar">
                <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
            </div>

            <div className="grid-layout">
              {productosFiltrados.map((p) => (
                <div key={p.id} className="card-item">
                  <div className="card-img-container">
                    <img src={p.imagen || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"} alt={p.nombre} className="product-img" />
                  </div>
                  <div className="card-body">
                    <h3>{p.nombre}</h3>
                    <div className="badge-stock">Stock: {p.stock} uds</div>
                    <div className="item-price">${p.precio}</div>
                  </div>
                  <button className="card-btn" onClick={() => crearPedido(p)}>📦 Realizar Pedido</button>
                </div>
              ))}
            </div>
          </>
        )}

        {pantalla === 'login' && (
          <div className="login-box">
            <form onSubmit={ejecutarLogin} className="auth-card">
              <h3>Control de Seguridad</h3>
              <div className="input-group">
                <label>Contraseña</label>
                <input type="password" placeholder="••••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-block">Confirmar Ingreso</button>
            </form>
          </div>
        )}

        {pantalla === 'admin' && (
          <div className="admin-dashboard">
            <div className="dashboard-nav">
              <button className={`tab-btn ${pestanaAdmin === 'pedidos' ? 'active' : ''}`} onClick={() => setPestanaAdmin('pedidos')}>
                📋 Pedidos ({pedidos.length})
              </button>
              <button className={`tab-btn ${pestanaAdmin === 'inventario' ? 'active' : ''}`} onClick={() => setPestanaAdmin('inventario')}>
                ⚙️ Inventario y Agregar Artículos
              </button>
            </div>

            {pestanaAdmin === 'pedidos' && (
              <div className="panel-card">
                <h3>Lista de Despacho</h3>
                <table className="custom-table">
                  <thead>
                    <tr><th>Orden</th><th>Cliente</th><th>Artículo</th><th>Total</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {pedidos.map((ped) => (
                      <tr key={ped.id}>
                        <td>#{ped.id}</td><td><strong>{ped.nombre_cliente}</strong></td><td>{ped.nombre_producto}</td><td className="txt-bold">${ped.precio}</td>
                        <td><button className="btn-danger" onClick={() => eliminarPedido(ped.id)}>❌ Completado</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pestanaAdmin === 'inventario' && (
              <div className="inventory-manager">
                <div className="panel-card">
                  <h3>Añadir Artículo con Foto Local</h3>
                  <form onSubmit={agregarProducto} className="inline-form-vertical">
                    <div className="form-row">
                      <input type="text" placeholder="Nombre" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required />
                      <input type="number" step="0.01" placeholder="Precio ($)" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} required />
                      <input type="number" placeholder="Stock" value={nuevoStock} onChange={(e) => setNuevoStock(e.target.value)} required />
                    </div>
                    <div className="file-upload-section">
                      <label>📂 Cargar Foto desde tu PC: </label>
                      <input type="file" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} />
                    </div>
                    <button type="submit" className="btn-success">💾 Cargar y Guardar en MariaDB</button>
                  </form>
                </div>

                <div className="panel-card" style={{ marginTop: '2rem' }}>
                  <h3>Editar Catálogo Existente</h3>
                  <table className="custom-table">
                    <thead>
                      <tr><th>Producto</th><th>Precio ($)</th><th>Stock (uds)</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {productos.map((prod) => (
                        <tr key={prod.id}>
                          <td><strong>{prod.nombre}</strong></td>
                          <td>
                            <input 
                              type="number" 
                              step="0.01" 
                              style={{color: 'black', padding: '4px'}}
                              defaultValue={prod.precio} 
                              onChange={(e) => setPreciosEditados({...preciosEditados, [prod.id]: e.target.value})}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              style={{color: 'black', padding: '4px', width: '70px'}}
                              defaultValue={prod.stock} 
                              onChange={(e) => setStocksEditados({...stocksEditados, [prod.id]: e.target.value})}
                            />
                          </td>
                          <td>
                            <button className="btn-primary" style={{padding: '5px 10px', fontSize: '0.85rem', marginRight: '5px'}} onClick={() => actualizarProductoEnDB(prod.id, prod.precio, prod.stock)}>Actualizar</button>
                            <button className="btn-danger" style={{padding: '5px 10px', fontSize: '0.85rem'}} onClick={() => eliminarProductoCompleto(prod.id)}>🗑️ Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;