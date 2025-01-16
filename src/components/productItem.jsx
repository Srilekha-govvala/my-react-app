import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

const VariantItem = ({ variant, index, onDiscountChange, showRemove, onRemove, productDiscount, productDiscountType }) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: variant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Use product discount as default if variant discount is not set
  const variantDiscount = variant.hasOwnProperty('discount') ? variant.discount : productDiscount;
  const variantDiscountType = variant.hasOwnProperty('discountType') ? variant.discountType : productDiscountType;

  return (
    <div ref={setNodeRef} style={style}>
      <div className="d-flex align-items-center">
        <div className="drag-handle me-3" {...attributes} {...listeners}>
          <div className="dots-grid">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <span className="d-flex align-items-center" style={{
          padding: '0.5rem',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '30px',
          marginBottom: '0.5rem',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          width: '44%',
          marginRight: '1rem',
          margin: '0.5rem',
        }}>{variant.title}</span>

        <div className="d-flex align-items-center">
          {!showDiscount ? (
            <button
              className="discount-btn"
              onClick={() => setShowDiscount(true)}
              style={{ width: '11rem' }}
            >
              Add Discount
            </button>
          ) : (
            <div className="d-flex align-items-center">
              <input
                type="number"
                style={{ width: '80px', borderRadius: '30px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)' }}
                className="form-control form-control-sm discount-input"
                value={variantDiscount || ''}
                onChange={(e) => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  onDiscountChange(index, 'value', value.toString());
                }}
                placeholder="0"
                min="0"
              />
              <select
                className="form-select form-select-sm discount-type"
                value={variantDiscountType || '%'}
                style={{ width: '80px', borderRadius: '30px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)' }}
                onChange={(e) => onDiscountChange(index, 'type', e.target.value)}
              >
                <option value="%">% Off</option>
                <option value="flat">Flat Off</option>
              </select>
            </div>
          )}

          {showRemove && (
            <button
              className="btn btn-sm remove-btn"
              onClick={onRemove}
              style={{ color: 'rgba(0, 0, 0, 0.4)'}}
            >
              X
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductItem = ({
  product,
  index,
  onEdit,
  onRemove,
  onDiscountChange,
  onVariantReorder,
  totalProducts,
  onVariantRemove,
}) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [variants, setVariants] = useState(product.selectedVariants || []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    setVariants(product.selectedVariants || []);
  }, [product.selectedVariants]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = variants.findIndex(v => v.id === active.id);
      const newIndex = variants.findIndex(v => v.id === over.id);
      const newVariants = Array.from(variants);
      const [removed] = newVariants.splice(oldIndex, 1);
      newVariants.splice(newIndex, 0, removed);
      setVariants(newVariants);
      onVariantReorder?.(newVariants);
    }
  };

  const handleVariantRemove = (variantIndex) => {
    const newVariants = [...variants];
    newVariants.splice(variantIndex, 1);
    onVariantRemove(index, newVariants);
  };

  // Determine if we should show remove buttons
  const showProductRemove = totalProducts > 1;
  const showVariantRemove = variants.length > 1;

  // If there's only one variant, show it instead of the product title
  const displayTitle = variants.length === 1 ? variants[0].title : product.title;

  return (
    <div ref={setNodeRef} style={style} className="product-item">
      <div className="d-flex align-items-center">
        <div className="drag-handle me-3" {...attributes} {...listeners}>
          <div className="dots-grid">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <span className="me-3">{index + 1}.</span>

        <div className="flex-grow-1 mb-1">
          {!displayTitle ? (
            <div className="row">
              <div
                className="select-product col-6"
                onClick={onEdit}
                style={{ cursor: 'pointer' }}
              >
                Select Product
                <FontAwesomeIcon
                  icon={faPen}
                  style={{
                    marginLeft: 'auto',
                    color: 'rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div className="col-4">
                {!showDiscount && (
                  <button
                    className="discount-btn"
                    onClick={() => setShowDiscount(true)}
                  >
                    Add Discount
                  </button>
                )}
                {showDiscount && (<div>Please select a product</div>)}
              </div>
            </div>
          ) : (
            <div className={variants.length === 1?"row pt-4":"row pt-5"}>
              <div className="col-6 product-title select-product">
                {displayTitle}
                <FontAwesomeIcon
                  icon={faPen}
                  onClick={onEdit}
                  style={{
                    marginLeft: 'auto',
                    color: 'rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div className="col-4 d-flex align-items-center">
                {!showDiscount ? (
                  <button
                    className="discount-btn"
                    onClick={() => setShowDiscount(true)}
                  >
                    Add Discount
                  </button>
                ) : (
                  <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <input
                      type="number"
                      className="form-control form-control-sm discount-input"
                      style={{
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                      }}
                      value={product.discount || ''}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        onDiscountChange(index, 'value', value.toString());
                      }}
                      placeholder="0"
                      min="0"
                    />
                    <select
                      className="form-select form-select-sm discount-type"
                      value={product.discountType || '%'}
                      style={{
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                      }}
                      onChange={(e) => onDiscountChange(index, 'type', e.target.value)}
                    >
                      <option value="%">% Off</option>
                      <option value="flat">Flat Off</option>
                    </select>
                  </div>
                )}

                {showProductRemove && (
                  <button
                    className="btn btn-sm remove-btn ms-2"
                    onClick={() => onRemove(index)}
                    style={{ color: 'rgba(0, 0, 0, 0.4)'}}
                  >
                    X
                  </button>
                )}
              </div>

              {variants.length > 1 && (
                <div className="variants-section mt-2">
                  <button
                    className="variants-toggle"
                    onClick={() => setShowVariants(!showVariants)}
                    style={{
                      marginLeft: 'auto',
                      display: 'block',
                      marginBottom: '0.5rem',
                      marginRight: '9.8rem'
                    }}
                  >
                    {showVariants ? (<><u>Hide variants</u>∧</>) : (<><u>Show variants</u>v</>)}
                  </button>

                  {showVariants && (
                    <DndContext
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={variants.map(v => v.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div style={{ paddingLeft: '1rem' }}>
                          {variants.map((variant, idx) => (
                            <VariantItem
                              key={variant.id}
                              variant={variant}
                              index={idx}
                              onDiscountChange={(idx, type, value) => {
                                const newVariants = [...variants];
                                if (type === 'value') {
                                  newVariants[idx].discount = value;
                                } else {
                                  newVariants[idx].discountType = value;
                                }
                                onVariantReorder(newVariants);
                              }}
                              showRemove={showVariantRemove}
                              onRemove={() => handleVariantRemove(idx)}
                              productDiscount={product.discount}
                              productDiscountType={product.discountType}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              )}
              <div style={{ color: 'rgba(0, 0, 0, 0.1)',marginLeft:'-1.6em'}}>____________________________________________________________________________________________</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;