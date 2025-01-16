import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProductPicker.css';

const ProductPicker = ({ show, onClose, onSelect, selectedProducts }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const modalBodyRef = useRef();
    const itemsPerPage = 10;
    const [tempSelectedProducts, setTempSelectedProducts] = useState([...selectedProducts]);

    const fetchProducts = async (searchTerm = search) => {
        if (loading || !hasMore) return;

        try {
            setLoading(true);
            const response = await fetch(
                `https://stageapi.monkcommerce.app/task/products/search?search=${searchTerm}&page=${page}&limit=${itemsPerPage}`,
                { headers: { 'x-api-key': '72njgfa948d9aS7gs5' } }
            );
            const data = await response.json();

            if (data.length < itemsPerPage) {
                setHasMore(false);
            }

            setProducts(prev => page === 0 ? data : [...prev, ...data]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            setProducts([]);
            setPage(0);
            setHasMore(true);
            fetchProducts();
            setTempSelectedProducts([...selectedProducts]);
        }
    }, [show, search, selectedProducts]);

    useEffect(() => {
        if (page > 0) {
            fetchProducts();
        }
    }, [page]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setProducts([]);
            setPage(0);
            setHasMore(true);
            fetchProducts(e.target.value);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setProducts([]);
        setPage(0);
        setHasMore(true);
        fetchProducts(e.target.value);
    };

    const handleScroll = () => {
        if (modalBodyRef.current) {
            const { scrollTop, clientHeight, scrollHeight } = modalBodyRef.current;
            if (scrollHeight - scrollTop <= clientHeight + 10 && !loading && hasMore) {
                setPage(prev => prev + 1);
            }
        }
    };

    const handleProductSelect = (product) => {
        const isSelected = tempSelectedProducts.some(p => p.id === product.id);
        if (isSelected) {
            setTempSelectedProducts(tempSelectedProducts.filter(p => p.id !== product.id));
        } else {
            const newProduct = { ...product, selectedVariants: product.variants || [] };
            setTempSelectedProducts([...tempSelectedProducts, newProduct]);
        }
    };

    const handleVariantSelect = (product, variant) => {
        let updatedSelection = [...tempSelectedProducts];
        const productIndex = updatedSelection.findIndex(p => p.id === product.id);

        if (productIndex === -1) {
            updatedSelection.push({ ...product, selectedVariants: [variant] });
        } else {
            const selectedProduct = updatedSelection[productIndex];
            const isVariantSelected = selectedProduct.selectedVariants.some(v => v.id === variant.id);

            if (isVariantSelected) {
                const updatedVariants = selectedProduct.selectedVariants.filter(v => v.id !== variant.id);
                if (updatedVariants.length === 0) {
                    updatedSelection = updatedSelection.filter(p => p.id !== product.id);
                } else {
                    updatedSelection[productIndex] = { ...selectedProduct, selectedVariants: updatedVariants };
                }
            } else {
                updatedSelection[productIndex] = { ...selectedProduct, selectedVariants: [...selectedProduct.selectedVariants, variant] };
            }
        }
        setTempSelectedProducts(updatedSelection);
    };

    const handleAddClick = () => {
        onSelect(tempSelectedProducts);
        onClose();
    };

    const handleCancelClick = () => {
        setTempSelectedProducts([...selectedProducts]);
        onClose();
    }

    const getProductSelectionState = (product) => {
        const selectedProduct = tempSelectedProducts.find(p => p.id === product.id);
        if (!selectedProduct) return 'none';
        if (selectedProduct.selectedVariants.length === product.variants.length) return 'partial';
        return 'partial';
    };

    return (
        <div className={`modal ${show ? 'show' : ''} modal-overlay`}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Select Products</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="search-container">
                        <input
                            type="search"
                            className="form-control"
                            placeholder="Search product"
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <div
                        className="modal-body"
                        ref={modalBodyRef}
                        onScroll={handleScroll}
                    >
                        {products.map((product) => {
                            const selectionState = getProductSelectionState(product);
                            return (
                                <div key={product.id} className="picker-product-item">
                                    <div className="d-flex align-items-center p-2 border-bottom">
                                        <input
                                            type="checkbox"
                                            className={`custom-checkbox ${selectionState !== 'none' ? 'partial' : ''}`}
                                            checked={selectionState !== 'none'}
                                            onChange={() => handleProductSelect(product)}
                                        />
                                        <img
                                            src={product.image?.src}
                                            className="product-thumbnail mx-2"
                                            alt={product.title}
                                        />
                                        <span>{product.title}</span>
                                    </div>
                                    <div className="variants-container">
                                        {product.variants?.map(variant => {
                                            const isVariantSelected = tempSelectedProducts.find(p => p.id === product.id)?.selectedVariants?.some(v => v.id === variant.id);
                                            return (
                                                <div
                                                    key={variant.id}
                                                    className="variant-picker-item d-flex align-items-center"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className={`custom-checkbox ms-4 ${isVariantSelected ? 'checked' : ''}`}
                                                        checked={isVariantSelected || false}
                                                        onChange={() => handleVariantSelect(product, variant)}
                                                    />
                                                    <span className="mx-2">{variant.title}</span>
                                                    <span className="availability">{variant.availability || '99'} available</span>
                                                    <span className="price">${variant.price}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="text-center p-3">
                                <div className="spinner-border spinner-border-sm"></div>
                            </div>
                        )}
                        {!hasMore && products.length > 0 && (
                            <div className="text-center p-2">No more products</div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <span className="selected-count me-auto">
                            {tempSelectedProducts.length === 1 ? '1 product selected' : `${tempSelectedProducts.length} products selected`}
                        </span>
                        <button type="button" className="btn btn-secondary" onClick={handleCancelClick}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleAddClick}
                            disabled={tempSelectedProducts.length === 0}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPicker;