let currentEditAisle = null;
let currentEditBay = null;
let currentEditTopstock = null;
function updateFooterTotals(data) {
    const totalAisles = data.length;
    let totalBays = 0;
    let totalTopstocks = 0;
    let totalFreeTopstocks = 0;
  
    data.forEach((aisle) => {
      totalBays += aisle.bays.length;
      aisle.bays.forEach((bay) => {
        totalTopstocks += bay.topstocks.length;
        bay.topstocks.forEach((topstock) => {
          // Check if the topstock has only blank products
          const hasOnlyBlankProducts = topstock.products.every(
            (product) =>
              !product.name &&
              !product.barcode &&
              product.quantity === 0 &&
              !product.expdate &&
              !product.date &&
              !product.department
          );
          if (hasOnlyBlankProducts) {
            totalFreeTopstocks++;
          }
        });
      });
    });
  
    // Update the footer totals
    document.getElementById("total-aisles").textContent = totalAisles;
    document.getElementById("total-bays").textContent = totalBays;
    document.getElementById("total-products").textContent = totalTopstocks;
    document.querySelector(".total-free-topstock").textContent = totalFreeTopstocks;
  }
// Fetch aisle data from the API
fetch("/api/aisles")
  .then((response) => response.json())
  .then((data) => {
    const app = document.getElementById("app");
    const searchBar = document.getElementById("search-bar");
    const dateFilter = document.getElementById("date-filter");
    const areaFilter = document.getElementById("area-filter");
    const departmentFilter = document.getElementById("department-filter");

    function renderAisles(filteredData) {
      app.innerHTML = ""; // Clear the container
      filteredData.forEach((aisle) => {
        const aisleDiv = document.createElement("div");
        aisleDiv.className = "aisle";

        const headerDiv = document.createElement("div");
        headerDiv.className = "aislehead";
        const aisleTitle = document.createElement("h2");
        aisleTitle.innerHTML = `<img src="assets/layers.svg" class="dropdown"/> Aisle: ${aisle.aisle} (${aisle.name})`;
        // aisleTitle.textContent = `Aisle: ${aisle.aisle} (${aisle.name})`;
        headerDiv.appendChild(aisleTitle);

        // Create a container for the buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        // Add the "Toggle Bay" button
        const toggleAisleButton = document.createElement("button");
        toggleAisleButton.innerHTML =
          "<img src='assets/droparrow.svg' class='dropdown'/>";
        toggleAisleButton.className = "toggle-button";
        toggleAisleButton.addEventListener("click", () => {
          const baysDiv = aisleDiv.querySelector(".bays");
          baysDiv.style.display =
            baysDiv.style.display === "none" ? "flex" : "none";
          toggleAisleButton.innerHTML =
            baysDiv.style.display === "none"
              ? "<img src='assets/droparrow.svg' class='dropdown' />"
              : "<img src='assets/uparrow.svg' class='dropdown' />";
        });
        buttonContainer.appendChild(toggleAisleButton);

        // Add the "Delete Aisle" button
        const deleteAisleButton = document.createElement("button");
        deleteAisleButton.innerHTML =
          "<img src='assets/delete.svg' class='dropdown'/>";
        deleteAisleButton.className = "delete-button";
        deleteAisleButton.addEventListener("click", () => {
          if (
            confirm(`Are you sure you want to delete Aisle ${aisle.aisle}?`)
          ) {
            fetch(`/api/delete-aisle/${aisle.aisle}`, {
              method: "DELETE",
            })
              .then((response) => {
                if (response.ok) {
                  alert("Aisle deleted successfully!");
                  location.reload();
                } else {
                  alert("Failed to delete aisle.");
                }
              })
              .catch((error) => console.error("Error deleting aisle:", error));
          }
        });
        const editAisleButton = document.createElement("button");
        editAisleButton.innerHTML =
          "<img src='assets/edit.svg' class='dropdown'/>";
        editAisleButton.className = "edit-button";
        editAisleButton.addEventListener("click", () => {
          openEditModal(aisle);
        });
        buttonContainer.appendChild(editAisleButton);
        buttonContainer.appendChild(deleteAisleButton);

        // Append the button container to the header
        headerDiv.appendChild(buttonContainer);

        aisleDiv.appendChild(headerDiv);

        const baysDiv = document.createElement("div");
        baysDiv.className = "bays";
        baysDiv.style.display = "none"; // Initially hide the bays

        aisle.bays.forEach((bay) => {
          const bayDiv = document.createElement("div");
          bayDiv.className = "bay";

          const bayHeader = document.createElement("div");
          bayHeader.className = "bay-header";

          const bayTitle = document.createElement("p");
          bayTitle.textContent = `Bay: ${bay.location}`;
          bayHeader.appendChild(bayTitle);

          const toggleBayButton = document.createElement("button");
          toggleBayButton.innerHTML =
            "<img src='assets/droparrow.svg' class='dropdown' />";
          toggleBayButton.className = "toggle-bay-button";
          toggleBayButton.addEventListener("click", () => {
            const topstocksDiv = bayDiv.querySelector(".topstocks");
            topstocksDiv.style.display =
              topstocksDiv.style.display === "none" ? "flex" : "none";
            toggleBayButton.innerHTML =
              topstocksDiv.style.display === "none"
                ? "<img src='assets/droparrow.svg' class='dropdown' />"
                : "<img src='assets/uparrow.svg' class='dropdown' />";
          });
          bayHeader.appendChild(toggleBayButton);
          bayDiv.appendChild(bayHeader);

          const topstocksDiv = document.createElement("div");
          topstocksDiv.className = "topstocks";
          topstocksDiv.style.display = "none"; // Initially hide the topstocks

          bay.topstocks.forEach((topstock) => {
            const topstockDiv = document.createElement("div");
  topstockDiv.className = "topstock";

  const topstockHeader = document.createElement("div");
  topstockHeader.className = "topstock-header";

  const topstockTitle = document.createElement("h4");
  topstockTitle.textContent = `Topstock ${topstock.id}`;
  topstockHeader.appendChild(topstockTitle);

  // Add the "Edit" button
  const editTopstockButton = document.createElement("button");
  editTopstockButton.innerHTML = "<img src='assets/edit.svg' class='dropdown'/>";
  editTopstockButton.className = "edit-button";
  editTopstockButton.addEventListener("click", () => {
    openEditProductsModal(aisle.aisle, bay.location, topstock);
  });
  topstockHeader.appendChild(editTopstockButton);

  topstockDiv.appendChild(topstockHeader);

  const topstockContent = document.createElement("div");
  topstockContent.className = "topstock-content";

  // Loop through all products in the topstock
  if (topstock.products && topstock.products.length > 0) {
    topstock.products.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.className = "product";

      // Display product details
      productDiv.textContent = `${product.name || "Unnamed Product"} 
        (Barcode: ${product.barcode || "N/A"} | 
        Qty: ${product.quantity || 0} |  
        Date: ${product.date || "No Date"} | 
        Expiry: ${product.expdate || "No Expiry"})`;

      topstockContent.appendChild(productDiv);
    });
  } else {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-message";
    emptyMessage.textContent = "No products in this topstock.";
    topstockContent.appendChild(emptyMessage);
  }

  topstockDiv.appendChild(topstockContent);
  topstocksDiv.appendChild(topstockDiv);
            topstocksDiv.appendChild(topstockDiv);
          });

          bayDiv.appendChild(topstocksDiv);
          baysDiv.appendChild(bayDiv);
        });

        aisleDiv.appendChild(baysDiv);
        app.appendChild(aisleDiv);
      });
    }

    // Ensure filterData is defined before adding the event listener
    function filterData() {
      const searchTerm = searchBar.value.toLowerCase();
      const dateValue = dateFilter.value;
      const areaValue = areaFilter.value.toLowerCase();
      const departmentValue = departmentFilter.value.toLowerCase();
      const expFilter = document.getElementById("exp-filter").value;

      // Start with the full dataset
      let filteredData = data;

      // Filter by area (aisle level)
      if (areaValue !== "none") {
        filteredData = filteredData.filter(
          (aisle) => aisle.area.toLowerCase() === areaValue
        );
      }

      // Filter by department (product level)
      if (departmentValue !== "none") {
        filteredData = filteredData.map((aisle) => ({
          ...aisle,
          bays: aisle.bays.map((bay) => ({
            ...bay,
            topstocks: bay.topstocks.map((topstock) => ({
              ...topstock,
              products: topstock.products.filter(
                (product) =>
                  product.department &&
                  product.department.toLowerCase() === departmentValue
              ),
            })).filter((topstock) => topstock.products.length > 0),
          })).filter((bay) => bay.topstocks.length > 0),
        })).filter((aisle) => aisle.bays.length > 0);
      }

      // Filter by search term (product name)
      if (searchTerm) {
        filteredData = filteredData.map((aisle) => ({
          ...aisle,
          bays: aisle.bays.map((bay) => ({
            ...bay,
            topstocks: bay.topstocks.map((topstock) => ({
              ...topstock,
              products: topstock.products.filter((product) =>
                product.name.toLowerCase().includes(searchTerm)
              ),
            })).filter((topstock) => topstock.products.length > 0),
          })).filter((bay) => bay.topstocks.length > 0),
        })).filter((aisle) => aisle.bays.length > 0);
      }

      // Filter by expiration date
      if (expFilter !== "none") {
        const today = new Date();
        filteredData = filteredData.map((aisle) => ({
          ...aisle,
          bays: aisle.bays.map((bay) => ({
            ...bay,
            topstocks: bay.topstocks.map((topstock) => ({
              ...topstock,
              products: topstock.products.filter((product) => {
                const expDate = new Date(product.expdate || "1970-01-01");
                if (expFilter === "expired") {
                  return expDate < today;
                } else if (expFilter === "not-expired") {
                  return expDate >= today;
                }
                return true;
              }),
            })).filter((topstock) => topstock.products.length > 0),
          })).filter((bay) => bay.topstocks.length > 0),
        })).filter((aisle) => aisle.bays.length > 0);
      }

      // Sort by date (if applicable)
      if (dateValue !== "none") {
        filteredData = filteredData.map((aisle) => ({
          ...aisle,
          bays: aisle.bays.map((bay) => ({
            ...bay,
            topstocks: bay.topstocks.map((topstock) => ({
              ...topstock,
              products: topstock.products.sort((a, b) => {
                const dateA = new Date(a.date || "1970-01-01");
                const dateB = new Date(b.date || "1970-01-01");
                return dateValue === "recent" ? dateB - dateA : dateA - dateB;
              }),
            })),
          })),
        }));
      }

      // Render the filtered data
      renderAisles(filteredData);
    }

    // Add event listeners
    const expFilter = document.getElementById("exp-filter");
    expFilter.addEventListener("change", filterData);
    searchBar.addEventListener("input", filterData);
    dateFilter.addEventListener("change", filterData);
    areaFilter.addEventListener("change", filterData);
    departmentFilter.addEventListener("change", filterData);

    renderAisles(data);
    updateFooterTotals(data) // Initial render
  })
  .catch((error) => console.error("Error fetching aisle data:", error));



// Add Aisle Functionality
document.getElementById("add-aisle-button").addEventListener("click", () => {
  document.getElementById("add-aisle-form").style.display = "block";
});

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("add-aisle-form").style.display = "none";
});

// Generate bays dynamically and ask for topstocks per bay
document.getElementById("generate-bays").addEventListener("click", () => {
  const numberOfBays = parseInt(
    document.getElementById("number-of-bays").value,
    10
  );
  const baysContainer = document.getElementById("bays-container");
  baysContainer.innerHTML = ""; // Clear previous bays

  for (let i = 0; i < numberOfBays; i++) {
    const bayDiv = document.createElement("div");
    bayDiv.className = "bay-input";

    const bayLabel = document.createElement("h3");
    bayLabel.textContent = `Bay ${i + 1}`;
    bayDiv.appendChild(bayLabel);

    const bayLocationInput = document.createElement("input");
    bayLocationInput.type = "text";
    bayLocationInput.placeholder = `Bay ${i + 1} Location`;
    bayLocationInput.className = "bay-location";
    bayDiv.appendChild(bayLocationInput);

    const topstocksInput = document.createElement("input");
    topstocksInput.type = "number";
    topstocksInput.placeholder = "Number of Topstocks";
    topstocksInput.className = "topstock-count";
    bayDiv.appendChild(topstocksInput);

    baysContainer.appendChild(bayDiv);
  }
});

// Submit the form and send data to the server
document.getElementById("aisle-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Get form values
  const aisleNumber = document.getElementById("aisle-number").value;
  const aisleName = document.getElementById("aisle-name").value;
  const aisleArea = document.getElementById("aisle-area").value;

  // Generate bays and topstocks
  const bays = Array.from(document.querySelectorAll(".bay-input")).map(
    (bayDiv, bayIndex) => {
      const bayLocation =
        bayDiv.querySelector(".bay-location").value || `00${bayIndex + 1}`;
      const topstocksCount = parseInt(
        bayDiv.querySelector(".topstock-count").value,
        10
      );

      const topstocks = [];
      for (let j = 0; j < topstocksCount; j++) {
        topstocks.push({
          id: j + 1,
          products: [
            {
              name: "",
              barcode: "",
              quantity: 0,
              expdate: "",
              date: "",
              department: "",
            },
          ],
        });
      }

      return { location: bayLocation, topstocks };
    }
  );

  // Create the aisle object
  const newAisle = {
    aisle: aisleNumber,
    name: aisleName,
    area: aisleArea,
    bays: bays,
  };

  // Send the aisle data to the server
  fetch("/api/add-aisle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newAisle),
  })
    .then((response) => {
      if (response.ok) {
        alert("Aisle added successfully!");
        location.reload();
      } else {
        response.text().then((text) => alert(`Failed to add aisle: ${text}`));
      }
    })
    .catch((error) => console.error("Error adding aisle:", error));
});
function openEditModal(aisle) {
  // Populate the modal with the aisle's current data
  document.getElementById("edit-aisle-number").value = aisle.aisle;
  document.getElementById("edit-aisle-name").value = aisle.name;
  document.getElementById("edit-aisle-area").value = aisle.area;

  const editBaysContainer = document.getElementById("edit-bays-container");
  editBaysContainer.innerHTML = ""; // Clear previous bays

  // Add each bay with location and topstock count input
  aisle.bays.forEach((bay) => {
    const bayDiv = document.createElement("div");
    bayDiv.className = "bay-input";

    const bayHeaderDiv = document.createElement("div");
    bayHeaderDiv.className = "bay-head";
    
    const bayBodyDiv = document.createElement("div");
  bayBodyDiv.className = "bay-body";

    const bayLabel = document.createElement("h3");
    bayLabel.textContent = `Bay ${bay.location}`;
    bayHeaderDiv.appendChild(bayLabel);


    const deleteBayButton = document.createElement("button");
    deleteBayButton.textContent = "Delete Bay";
    deleteBayButton.className = "delete-bay-button";
    deleteBayButton.addEventListener("click", () => {
      bayDiv.remove(); // Remove the bay from the DOM
    });
    bayHeaderDiv.appendChild(deleteBayButton);


    const bayLocationInput = document.createElement("input");
    bayLocationInput.type = "number";
    bayLocationInput.value = bay.location;
    bayLocationInput.className = "edit-bay-location";
    bayBodyDiv.appendChild(bayLocationInput);

    const bayTopstocksInput = document.createElement("input");
    bayTopstocksInput.type = "number";
    bayTopstocksInput.value = bay.topstocks ? bay.topstocks.length : 0; // Default to 0 if no topstocks
    bayTopstocksInput.className = "edit-bay-topstocks";
    bayTopstocksInput.placeholder = "Topstock Count";
    bayBodyDiv.appendChild(bayTopstocksInput);

    
    bayDiv.appendChild(bayHeaderDiv);
    bayDiv.appendChild(bayBodyDiv);
  editBaysContainer.appendChild(bayDiv);
  });

  // Show the modal
  document.getElementById("edit-aisle-form").style.display = "block";
}

// Close the modal
document.getElementById("close-edit-modal").addEventListener("click", () => {
  document.getElementById("edit-aisle-form").style.display = "none";
});

// Add a new bay
document.getElementById("add-bay-button").addEventListener("click", () => {
  const editBaysContainer = document.getElementById("edit-bays-container");

  const bayDiv = document.createElement("div");
  bayDiv.className = "bay-input";

  const bayHeaderDiv = document.createElement("div");
    bayHeaderDiv.className = "bay-head";
  
  const bayBodyDiv = document.createElement("div");
  bayBodyDiv.className = "bay-body";

  const bayLabel = document.createElement("h3");
  bayLabel.textContent = `Bay New`;
  bayHeaderDiv.appendChild(bayLabel);
  const deleteBayButton = document.createElement("button");
  deleteBayButton.textContent = "Delete Bay";
  deleteBayButton.className = "delete-bay-button";
  deleteBayButton.addEventListener("click", () => {
    bayDiv.remove(); // Remove the bay from the DOM
  });
  bayHeaderDiv.appendChild(deleteBayButton);

  const bayLocationInput = document.createElement("input");
  bayLocationInput.type = "text";
  bayLocationInput.placeholder = "Bay Location";
  bayLocationInput.className = "edit-bay-location";
  bayBodyDiv.appendChild(bayLocationInput);

  const bayTopstocksInput = document.createElement("input");
  bayTopstocksInput.type = "number";
  bayTopstocksInput.placeholder = "Topstock Count";
  bayTopstocksInput.className = "edit-bay-topstocks";
  bayBodyDiv.appendChild(bayTopstocksInput);

  
  bayDiv.appendChild(bayHeaderDiv);
  bayDiv.appendChild(bayBodyDiv);
  editBaysContainer.appendChild(bayDiv);
});

// Submit the updated aisle data
document.getElementById("edit-aisle-form-content").addEventListener("submit", (e) => {
  e.preventDefault();

  const aisleNumber = document.getElementById("edit-aisle-number").value;
  const aisleName = document.getElementById("edit-aisle-name").value;
  const aisleArea = document.getElementById("edit-aisle-area").value;

  const bays = Array.from(document.querySelectorAll(".bay-input")).map((bayDiv) => {
    const bayLocation = bayDiv.querySelector(".edit-bay-location").value;
    const bayTopstocksCount = parseInt(bayDiv.querySelector(".edit-bay-topstocks").value, 10) || 0;

    // Generate topstocks array based on the count
    const topstocks = Array.from({ length: bayTopstocksCount }, (_, index) => ({
      id: index + 1,
      products: [],
    }));

    return { location: bayLocation, topstocks };
  });

  const updatedAisle = {
    aisle: aisleNumber,
    name: aisleName,
    area: aisleArea,
    bays: bays,
  };

  // Send the updated aisle data to the server
  fetch(`/api/update-aisle/${aisleNumber}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedAisle),
  })
    .then((response) => {
      if (response.ok) {
        alert("Aisle updated successfully!");
        location.reload();
      } else {
        response.text().then((text) => alert(`Failed to update aisle: ${text}`));
      }
    })
    .catch((error) => console.error("Error updating aisle:", error));
});
function openEditProductsModal(aisleNumber, bayLocation, topstock) {
  // Populate the modal with the topstock's current data
  document.getElementById("edit-products-aisle-number").placeholder = aisleNumber;
  document.getElementById("edit-products-bay-location").placeholder = bayLocation;
  document.getElementById("edit-products-topstock-id").placeholder = topstock.id;
  console.log(topstock)
  console.log(aisleNumber, bayLocation)
  // document.querySelector('.edit-product-expdate').value = topstock.product.expdate
  // document.querySelector('.edit-product-update').value = topstock.product.date

  const productsContainer = document.getElementById("edit-products-container");
  productsContainer.className = "products-modal-container";
  productsContainer.innerHTML = ""; // Clear previous products
  const noProds = document.createElement("p");
  noProds.className = "no-products";
  noProds.textContent = "No products in this topstock.";

  if(topstock.products.length === 0){
    productsContainer.appendChild(noProds);
  }

  topstock.products.forEach((product, productIndex) => {
    productsContainer.innerHTML = ""; // Clear previous products
    const productDiv = document.createElement("div");
    productDiv.className = "product-input";

    const prodInfo = document.createElement("div");
    prodInfo.className = "prod-info";

    const prodDate = document.createElement("div");
    prodDate.className = "prod-date";

    const prodExt = document.createElement("div");
    prodExt.className = "prod-ext";

  const productNameLabel = document.createElement("label");
  productNameLabel.textContent = "Product Name:";
  const productNameInput = document.createElement("input");
  productNameInput.type = "text";
  productNameInput.value = product.name || "";
  productNameInput.className = "edit-product-name";
  prodInfo.appendChild(productNameInput);

  const productBarcodeLabel = document.createElement("label");
  productBarcodeLabel.textContent = "Barcode:";
  const productBarcodeInput = document.createElement("input");
  productBarcodeInput.type = "text";
  productBarcodeInput.value = product.barcode || "";
  productBarcodeInput.className = "edit-product-barcode";
  prodInfo.appendChild(productBarcodeInput);

  const productQuantityLabel = document.createElement("label");
  productQuantityLabel.textContent = "Quantity:";
  const productQuantityInput = document.createElement("input");
  productQuantityInput.type = "number";
  productQuantityInput.value = product.quantity || 0;
  productQuantityInput.className = "edit-product-quantity";
  prodExt.appendChild(productQuantityInput);


  const prodexdiv = document.createElement('div')
  prodexdiv.className = 'prodexdiv'

  const productExpDateLabel = document.createElement("label");
  productExpDateLabel.textContent = "Expiry Date:";
  const productExpDateInput = document.createElement("input");
  productExpDateInput.type = "date";
  productExpDateInput.value = product.expdate || "";
  productExpDateInput.className = "edit-product-expdate";
  prodexdiv.appendChild(productExpDateLabel)
  prodexdiv.appendChild(productExpDateInput);


    const produpdiv = document.createElement('div') 
    produpdiv.className = 'produpdiv'

  const productUpdateDateInput = document.createElement("label");
  productUpdateDateInput.textContent = "Date:";
  const productupdate = document.createElement("input");
  productupdate.type = "date";
  productupdate.value = product.date || "";
  productupdate.className = "edit-product-update";
  produpdiv.appendChild(productUpdateDateInput)
  produpdiv.appendChild(productupdate);


  const productDepartmentLabel = document.createElement("label");
  productDepartmentLabel.textContent = "Department:";
  const productDepartment = document.createElement("input");
  productDepartment.type = "text";
  productDepartment.value = product.department || "";
  productDepartment.className = "edit-product-department";
  prodExt.appendChild(productDepartment);

  productDiv.appendChild(prodInfo)
  productDiv.appendChild(prodExt)
  prodDate.appendChild(produpdiv)
  prodDate.appendChild(prodexdiv)
  productDiv.appendChild(prodDate)

    // Add a delete button for the product
    const deleteProductButton = document.createElement("button");
    deleteProductButton.textContent = "Delete";
    deleteProductButton.className = "delete-product-button";
    deleteProductButton.addEventListener("click", () => {
      productDiv.remove();
    });
    productDiv.appendChild(deleteProductButton);

    productsContainer.appendChild(productDiv);
  });

  // Show the modal
  document.getElementById("edit-products-form").style.display = "block";
}

// Close the modal
document
  .getElementById("close-edit-products-modal")
  .addEventListener("click", () => {
    document.getElementById("edit-products-form").style.display = "none";
  });

// Add a new product
document.getElementById("add-product-button").addEventListener("click", () => {
  const productsContainer = document.getElementById("edit-products-container");

  
  const noProds = document.querySelector(".no-products")

  if(noProds !== null){
    noProds.remove()
  }else{
   
  

  const productDiv = document.createElement("div");
  productDiv.className = "product-input";

  const prodInfo = document.createElement("div");
    prodInfo.className = "prod-info";

  const prodDate = document.createElement("div");
    prodInfo.className = "prod-date";

  const prodExt = document.createElement("div");
    prodInfo.className = "prod-ext";


  const productNameInput = document.createElement("input");
  productNameInput.type = "text";
  productNameInput.placeholder = "Product Name";
  productNameInput.className = "edit-product-name";
  prodInfo.appendChild(productNameInput);

  const productBarcodeInput = document.createElement("input");
  productBarcodeInput.type = "text";
  productBarcodeInput.placeholder = "Barcode";
  productBarcodeInput.className = "edit-product-barcode";
  prodInfo.appendChild(productBarcodeInput);

  
  const productQuantityInput = document.createElement("input");
  productQuantityInput.type = "number";
  productQuantityInput.placeholder = "Quantity";
  productQuantityInput.className = "edit-product-quantity";
  prodExt.appendChild(productQuantityInput);
  
    const prodexdiv = document.createElement('div')
    prodexdiv.className = 'prodexdiv'

  const productExpDateLabel = document.createElement("label");
  productExpDateLabel.textContent = "Expiry Date:";
  const productExpDateInput = document.createElement("input");
  productExpDateInput.type = "date";
  productExpDateInput.placeholder = "Expiry Date";
  productExpDateInput.className = "edit-product-expdate";
  prodexdiv.appendChild(productExpDateLabel)
  prodexdiv.appendChild(productExpDateInput);

  const produpdiv = document.createElement('div')
  produpdiv.className = 'produpdiv'

  const productUpdateDateInput = document.createElement("label");
  productUpdateDateInput.textContent = "Date:";
  const productupdate = document.createElement("input");
  productupdate.type = "date";
  productupdate.placeholder = "Date";
  productupdate.className = "edit-product-update";
  produpdiv.appendChild(productUpdateDateInput)
  produpdiv.appendChild(productupdate);


  const productDepartmentLabel = document.createElement("label");
  productDepartmentLabel.textContent = "Department:";
  const productDepartment = document.createElement("input");
  productDepartment.type = "text";
  productDepartment.placeholder = "Product Department";
  productDepartment.className = "edit-product-department";
  prodExt.appendChild(productDepartment);

  productDiv.appendChild(prodInfo)
  productDiv.appendChild(prodExt)
  prodDate.appendChild(produpdiv)
  prodDate.appendChild(prodexdiv)
  productDiv.appendChild(prodDate)
  


  const deleteProductButton = document.createElement("button");
  deleteProductButton.textContent = "Delete";
  deleteProductButton.className = "delete-product-button";
  deleteProductButton.addEventListener("click", () => {
    productDiv.remove();
  });
  productDiv.appendChild(deleteProductButton);

  productsContainer.appendChild(productDiv);

}

});

// Submit the updated products
document
  .getElementById("edit-products-form-content")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const aisleNumber = document.getElementById(
      "edit-products-aisle-number"
    ).value;
    const bayLocation = document.getElementById(
      "edit-products-bay-location"
    ).value;
    const topstockId = parseInt(
      document.getElementById("edit-products-topstock-id").value,
      10
    );
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, '0'); // Get the day (2 digits)
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Get the month (0-based, so add 1)
    const year = currentDate.getFullYear(); // Get the year

    const formattedDate = `${day}/${month}/${year}`; // Format the date as dd/mm/yyyy


    const products = Array.from(
      document.querySelectorAll(".product-input")
    ).map((productDiv) => ({
      name: productDiv.querySelector(".edit-product-name").value,
      barcode: productDiv.querySelector(".edit-product-barcode").value,
      quantity:
        parseInt(
          productDiv.querySelector(".edit-product-quantity").value,
          10
        ) || 0,
      expdate: productDiv.querySelector(".edit-product-expdate").value,
      date: productDiv.querySelector(".edit-product-update").value || formattedDate,
      department:
        productDiv.querySelector(".edit-product-department").value || "",
    }));

    const updatedTopstock = {
      id: topstockId,
      products,
    };

    // Send the updated topstock data to the server
    fetch("/api/update-topstock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aisleNumber,
        bayLocation,
        topstock: updatedTopstock,
      }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Products updated successfully!");
          location.reload();
        } else {
          response
            .text()
            .then((text) => alert(`Failed to update products: ${text}`));
        }
      })
      .catch((error) => console.error("Error updating products:", error));
  });

