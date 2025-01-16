import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import ProductItem from './productItem';

const ProductList = ({
  products,
  onEdit,
  onRemove,
  onDiscountChange,
  onProductsReorder = () => { },
  onVariantsUpdate = () => { }
}) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = products.findIndex(p => p.id === active.id);
      const newIndex = products.findIndex(p => p.id === over.id);

      const newProducts = Array.from(products);
      const [removed] = newProducts.splice(oldIndex, 1);
      newProducts.splice(newIndex, 0, removed);

      onProductsReorder(newProducts);
    }
  };

  const handleVariantReorder = (productIndex, newVariants) => {
    if (!onVariantsUpdate) return;
    const updatedProducts = [...products];
    updatedProducts[productIndex].selectedVariants = newVariants;
    onVariantsUpdate(updatedProducts);
  };

  const handleVariantRemove = (productIndex, newVariants) => {
    if (!onVariantsUpdate) return;
    const updatedProducts = [...products];
    updatedProducts[productIndex].selectedVariants = newVariants;
    onVariantsUpdate(updatedProducts);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={products.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="product-list">
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              index={index}
              onEdit={() => onEdit(index)}
              onRemove={() => onRemove(index)}
              onDiscountChange={(index, type, value) => {
                onDiscountChange(index, type, value);
              }}
              onVariantReorder={(newVariants) => handleVariantReorder(index, newVariants)}
              onVariantRemove={(productIndex, newVariants) => handleVariantRemove(productIndex, newVariants)}
              totalProducts={products.length}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ProductList;