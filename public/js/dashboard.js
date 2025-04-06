document.addEventListener("DOMContentLoaded", () => {
  // Extract CSS variables for colors
  const rootStyles = getComputedStyle(document.documentElement);
  const colorPrimary = rootStyles.getPropertyValue("--color-primary").trim();
  const colorPrimaryLight = rootStyles.getPropertyValue("--color-primary-light").trim();
  const colorPrimaryDark = rootStyles.getPropertyValue("--color-primary-dark").trim();
  const colorSecondary = rootStyles.getPropertyValue("--color-secondary").trim();
  const colorSecondaryLight = rootStyles.getPropertyValue("--color-secondary-light").trim();
  const colorSecondaryDark = rootStyles.getPropertyValue("--color-secondary-dark").trim();

  fetch("/api/aisles")
    .then((response) => response.json())
    .then((data) => {
      // Helper function to format dates as dd/mm/yyyy
      function formatDate(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }

      // Calculate totals
      const totalAisles = data.length;
      let totalBays = 0;
      let totalTopstocks = 0;
      let totalFreeTopstocks = 0;
      let totalProducts = 0;

      const departmentUsage = {};
      const productsWithExpiry = [];
      const productsWithDates = [];
      const areaOverstocks = {};

      data.forEach((aisle) => {
        totalBays += aisle.bays.length;
        aisle.bays.forEach((bay) => {
          totalTopstocks += bay.topstocks.length;
          bay.topstocks.forEach((topstock) => {
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
            } else {
              // Count topstocks in use by department
              topstock.products.forEach((product) => {
                if (product.department) {
                  departmentUsage[product.department] =
                    (departmentUsage[product.department] || 0) + 1;
                }
                // Collect products with expiry dates
                if (product.expdate) {
                  productsWithExpiry.push({
                    ...product,
                    expdate: new Date(product.expdate),
                    aisle: aisle.aisle, // Add aisle number
                    bay: bay.location, // Add bay location
                  });
                }
                // Collect products with dates for longest sitting calculation
                if (product.date) {
                  productsWithDates.push({
                    ...product,
                    date: new Date(product.date),
                    aisle: aisle.aisle, // Add aisle number
                    bay: bay.location, // Add bay location
                  });
                }
              });
            }
            totalProducts += topstock.products.length;
          });
        });

        // Calculate overstocks by area
        if (!areaOverstocks[aisle.area]) {
          areaOverstocks[aisle.area] = { total: 0, used: 0 };
        }
        aisle.bays.forEach((bay) => {
          bay.topstocks.forEach((topstock) => {
            const isFree = topstock.products.every(
              (product) =>
                !product.name &&
                !product.barcode &&
                product.quantity === 0 &&
                !product.expdate &&
                !product.date &&
                !product.department
            );
            areaOverstocks[aisle.area].total++;
            if (!isFree) {
              areaOverstocks[aisle.area].used++;
            }
          });
        });
      });

      // Update totals in the DOM
      document.getElementById("dashboard-total-aisles").textContent =
        totalAisles;
      document.getElementById("dashboard-total-bays").textContent = totalBays;
      document.getElementById("dashboard-total-topstocks").textContent =
        totalTopstocks;
      document.getElementById("dashboard-total-free-topstocks").textContent =
        totalFreeTopstocks;
      document.getElementById("dashboard-total-products").textContent =
        totalProducts;

      // Render the first doughnut chart (Topstocks Overview)
      const ctx1 = document.getElementById("topstocksChart").getContext("2d");
      new Chart(ctx1, {
        type: "doughnut",
        data: {
          labels: ["Free Topstocks", "Topstocks in Use"],
          datasets: [
            {
              data: [totalFreeTopstocks, totalTopstocks - totalFreeTopstocks],
              backgroundColor: [colorPrimaryLight, colorPrimary],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      });

      // Render the second doughnut chart (Topstocks by Department)
      const ctx2 = document.getElementById("departmentChart").getContext("2d");
      new Chart(ctx2, {
        type: "doughnut",
        data: {
          labels: Object.keys(departmentUsage),
          datasets: [
            {
              data: Object.values(departmentUsage),
              backgroundColor: [
                colorPrimary,
                colorPrimaryLight,
                colorPrimaryDark,
                colorSecondary,
                colorSecondaryLight,
                colorSecondaryDark,
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      });

      // Render doughnut charts for each area
      const dashboardContainer = document.querySelector(".dashboard-container");
      Object.entries(areaOverstocks).forEach(([area, { total, used }]) => {
        const section = document.createElement("div");
        section.className = "dashboard-section";

        const title = document.createElement("h2");
        title.textContent = `${area} Overstocks`;
        section.appendChild(title);

        const canvas = document.createElement("canvas");
        section.appendChild(canvas);

        dashboardContainer.appendChild(section);

        new Chart(canvas.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: ["Used", "Free"],
            datasets: [
              {
                data: [used, total - used],
                backgroundColor: [colorSecondary, colorSecondaryLight],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
            },
          },
        });
      });

      // Sort products by expiry date and get the top 5 closest to expiry
      productsWithExpiry.sort((a, b) => a.expdate - b.expdate);
      const top5Expiry = productsWithExpiry.slice(0, 5);

      // Render the top 5 closest to expiry in the DOM
      const expiryList = document.getElementById("expiry-list");
      top5Expiry.forEach((product) => {
        const listItem = document.createElement("li");
        const location = `${product.aisle}-${product.bay}`; // Format location as AisleNo-BayNo
        listItem.textContent = `${product.name || "Unnamed Product"} - Expiry: ${
          formatDate(product.expdate)
        } (Location: ${location})`;
        expiryList.appendChild(listItem);
      });

      // Sort products by the longest sitting date
      productsWithDates.sort((a, b) => a.date - b.date);
      const top5LongestSitting = productsWithDates.slice(0, 5);

      // Render the top 5 longest sitting products in the DOM
      const longestSittingList = document.getElementById("longest-sitting-list");
      top5LongestSitting.forEach((product) => {
        const listItem = document.createElement("li");
        const location = `${product.aisle}-${product.bay}`; // Format location as AisleNo-BayNo
        listItem.textContent = `${product.name || "Unnamed Product"} - Added: ${
          formatDate(product.date)
        } (Location: ${location})`;
        longestSittingList.appendChild(listItem);
      });
    })
    .catch((error) => console.error("Error fetching aisle data:", error));
});
