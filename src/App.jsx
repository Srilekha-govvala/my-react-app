import React, { useState } from 'react';
import ProductList from './components/ProductList';
import ProductPicker from './components/ProductPicker';
import { DndContext } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import './App.css';

const App = () => {
  const [products, setProducts] = useState([{ id: Date.now(), title: '', showVariants: false }]);
  const [showPicker, setShowPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleAddProduct = () => {
    setProducts([...products, { id: Date.now(), title: '', showVariants: false }]);
  };

  const handleEditProduct = (index) => {
    setEditingIndex(index);
    setShowPicker(true);
  };

  const handleProductSelect = (selectedProducts) => {
    setSelectedProducts(selectedProducts);
    if (selectedProducts.length > 0 && editingIndex !== null) {
      const newProducts = [
        ...products.slice(0, editingIndex),
        ...selectedProducts.map(product => ({ ...product, showVariants: false })),
        ...products.slice(editingIndex + 1),
      ];
      setProducts(newProducts);
    }
  };

  const handlePickerClose = () => {
    setShowPicker(false);
    setSelectedProducts([]);
    setEditingIndex(null);
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleDiscountChange = (index, field, value) => {
    const newProducts = [...products];
    if (field === 'type') {
      newProducts[index].discountType = value;
    } else {
      newProducts[index].discount = value;
    }
    setProducts(newProducts);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = products.findIndex(p => p.id === active.id);
      const newIndex = products.findIndex(p => p.id === over.id);
      setProducts(arrayMove(products, oldIndex, newIndex));
    }
  };

  const handleProductsReorder = (newProducts) => {
    setProducts(newProducts);
  };

  const handleVariantsUpdate = (updatedProducts) => {
    setProducts(updatedProducts);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="container py-4">
        <h3>Add Products</h3>
        <br/>
        <div className="row">
          <div className="col-12 col-lg-8">
            <div className="row align-items-center">
              <div className="col-1"></div>
              <h5 className="col-6 text-start">Product</h5>
              <h5 className="col-1 text-center">Discount</h5>
            </div>
            <ProductList
              products={products}
              onEdit={handleEditProduct}
              onRemove={handleRemoveProduct}
              onDiscountChange={handleDiscountChange}
              onProductsReorder={handleProductsReorder}
              onVariantsUpdate={handleVariantsUpdate}
            />
            <div className="d-flex col-9 justify-content-end align-items-center">
              <button className="add-product-btn mt-3" onClick={handleAddProduct}>
                Add Product
              </button>
            </div>
          </div>
        </div>

        <ProductPicker
          show={showPicker}
          onClose={handlePickerClose}
          onSelect={handleProductSelect}
          selectedProducts={selectedProducts}
        />
      </div>
    </DndContext>
  );
};

export default App;