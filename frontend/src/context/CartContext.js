import React, { createContext, useContext, useReducer } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload._id);
      const items = existing
        ? state.items.map(i => i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.items, { ...action.payload, quantity: 1 }];
      return { ...state, items };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.payload) };
    case 'UPDATE_QTY': {
      if (action.payload.qty <= 0) return { ...state, items: state.items.filter(i => i._id !== action.payload.id) };
      return { ...state, items: state.items.map(i => i._id === action.payload.id ? { ...i, quantity: action.payload.qty } : i) };
    }
    case 'CLEAR':
      return { ...state, items: [] };
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    toast.success(`${product.emoji} ${product.name} added to cart!`);
  };

  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR' });
  const openCart = () => dispatch({ type: 'SET_OPEN', payload: true });
  const closeCart = () => dispatch({ type: 'SET_OPEN', payload: false });

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, total, count, addItem, removeItem, updateQty, clearCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
