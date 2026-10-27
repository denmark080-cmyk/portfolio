export const SCHEMA_DATA = {
  snowflake: {
    title: "Snowflake Architecture",
    description:
      "The product dimension is normalized into 4 hierarchical levels (Product → Subcategory → Category → Department). This eliminates redundant data rows while introducing multi-table joins for department queries.",
    complexity: "Normalized (4-Level Product Depth)",
    metrics: { dims: 5, cols: 32, joins: 7 },
    tables: [
      {
        id: "Fact_Sales",
        name: "Fact_Sales",
        type: "fact",
        icon: "ph-lightning",
        pos: { x: 580, y: 310 },
        columns: [
          { name: "CustomerID", key: "FK", type: "INT", role: "Dimension FK" },
          { name: "DeliveryDateKey", key: "", type: "INT", role: "Metric Σ / FK" },
          { name: "OrderDateKey", key: "FK", type: "INT", role: "Dimension FK" },
          { name: "OrderNumber", key: "", type: "VARCHAR(40)", role: "Metric Σ" },
          { name: "PaymentType", key: "", type: "VARCHAR(20)", role: "Attribute" },
          { name: "ProductID", key: "FK", type: "INT", role: "Dimension FK" },
          { name: "PromoFlag", key: "", type: "BOOLEAN", role: "Flag" },
          { name: "Quantity", key: "", type: "INT", role: "Metric Σ" },
          { name: "RushFlag", key: "", type: "BOOLEAN", role: "Flag" }
        ]
      },
      {
        id: "Dim_Product_Snowflake",
        name: "Dim_Product_Snowflake",
        type: "subdim",
        icon: "ph-cube",
        pos: { x: 260, y: 70 },
        columns: [
          { name: "Brand", key: "", type: "VARCHAR(50)", role: "Attribute" },
          { name: "ProductID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "ProductName", key: "", type: "VARCHAR(100)", role: "Attribute" },
          { name: "SubcategoryID", key: "FK", type: "INT", role: "Parent FK" }
        ]
      },
      {
        id: "Dim_Subcategory",
        name: "Dim_Subcategory",
        type: "subdim",
        icon: "ph-folder-notch-open",
        pos: { x: 60, y: 250 },
        columns: [
          { name: "CategoryID", key: "FK", type: "INT", role: "Parent FK" },
          { name: "SubcategoryID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "SubcategoryName", key: "", type: "VARCHAR(60)", role: "Attribute" }
        ]
      },
      {
        id: "Dim_Category",
        name: "Dim_Category",
        type: "subdim",
        icon: "ph-squares-four",
        pos: { x: 60, y: 440 },
        columns: [
          { name: "CategoryID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "CategoryName", key: "", type: "VARCHAR(60)", role: "Attribute" },
          { name: "DepartmentID", key: "FK", type: "INT", role: "Parent FK" }
        ]
      },
      {
        id: "Dim_Department",
        name: "Dim_Department",
        type: "subdim",
        icon: "ph-buildings",
        pos: { x: 190, y: 620 },
        columns: [
          { name: "DepartmentID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "DepartmentName", key: "", type: "VARCHAR(60)", role: "Attribute" }
        ]
      },
      {
        id: "Dim_Customer",
        name: "Dim_Customer",
        type: "dim",
        icon: "ph-users-three",
        pos: { x: 700, y: 60 },
        columns: [
          { name: "City", key: "", type: "VARCHAR(50)", role: "Attribute" },
          { name: "CustomerID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "CustomerName", key: "", type: "VARCHAR(100)", role: "Attribute" },
          { name: "Province", key: "", type: "VARCHAR(50)", role: "Attribute" },
          { name: "Segment", key: "", type: "VARCHAR(30)", role: "Attribute" }
        ]
      },
      {
        id: "Dim_Date",
        name: "Dim_Date",
        type: "dim",
        icon: "ph-calendar",
        pos: { x: 600, y: 640 },
        columns: [
          { name: "Date", key: "", type: "DATE", role: "Calendar Date" },
          { name: "DateKey", key: "PK", type: "INT", role: "Primary Key" },
          { name: "Day", key: "", type: "INT", role: "Metric Σ" },
          { name: "DayName", key: "", type: "VARCHAR(15)", role: "Attribute" },
          { name: "Month", key: "", type: "INT", role: "Metric Σ" },
          { name: "MonthName", key: "", type: "VARCHAR(15)", role: "Attribute" },
          { name: "Quarter", key: "", type: "VARCHAR(10)", role: "Attribute" },
          { name: "Year", key: "", type: "INT", role: "Metric Σ" }
        ]
      },
      {
        id: "Dim_Store",
        name: "Dim_Store",
        type: "dim",
        icon: "ph-storefront",
        pos: { x: 970, y: 470 },
        columns: [
          { name: "Manager", key: "", type: "VARCHAR(60)", role: "Attribute" },
          { name: "Region", key: "", type: "VARCHAR(40)", role: "Attribute" },
          { name: "StoreID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "StoreName", key: "", type: "VARCHAR(60)", role: "Attribute" }
        ]
      }
    ],
    relationships: [
      { from: "Dim_Customer", fromKey: "CustomerID", to: "Fact_Sales", toKey: "CustomerID", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Product_Snowflake", fromKey: "ProductID", to: "Fact_Sales", toKey: "ProductID", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Subcategory", fromKey: "SubcategoryID", to: "Dim_Product_Snowflake", toKey: "SubcategoryID", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Category", fromKey: "CategoryID", to: "Dim_Subcategory", toKey: "CategoryID", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Department", fromKey: "DepartmentID", to: "Dim_Category", toKey: "DepartmentID", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Date", fromKey: "DateKey", to: "Fact_Sales", toKey: "OrderDateKey", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Store", fromKey: "StoreID", to: "Fact_Sales", toKey: "RushFlag", cardFrom: "1", cardTo: "*" }
    ]
  },

  star: {
    title: "Star Architecture",
    description:
      "Denormalized star structure optimized for rapid analytical queries. Product, Subcategory, Category, and Department are flattened into a single Dim_Product table, eliminating all snowflake join chains.",
    complexity: "Optimized (1-Hop Joins Only)",
    metrics: { dims: 4, cols: 27, joins: 4 },
    tables: [
      {
        id: "Fact_Sales",
        name: "Fact_Sales",
        type: "fact",
        icon: "ph-lightning",
        pos: { x: 560, y: 350 },
        columns: [
          { name: "CustomerID", key: "FK", type: "INT", role: "Dimension FK" },
          { name: "DeliveryDateKey", key: "", type: "INT", role: "Metric Σ / FK" },
          { name: "OrderDateKey", key: "FK", type: "INT", role: "Dimension FK" },
          { name: "OrderNumber", key: "", type: "VARCHAR(40)", role: "Metric Σ" },
          { name: "PaymentType", key: "", type: "VARCHAR(20)", role: "Attribute" },
          { name: "ProductID", key: "FK", type: "INT", role: "Dimension FK" },
          { name: "PromoFlag", key: "", type: "BOOLEAN", role: "Flag" },
          { name: "Quantity", key: "", type: "INT", role: "Metric Σ" },
          { name: "RushFlag", key: "", type: "BOOLEAN", role: "Flag" }
        ]
      },
      {
        id: "Dim_Date",
        name: "Dim_Date",
        type: "dim",
        icon: "ph-calendar",
        pos: { x: 530, y: 60 },
        columns: [
          { name: "Date", key: "", type: "DATE", role: "Calendar Date" },
          { name: "DateKey", key: "PK", type: "INT", role: "Primary Key" },
          { name: "Day", key: "", type: "INT", role: "Metric Σ" },
          { name: "DayName", key: "", type: "VARCHAR(15)", role: "Attribute" },
          { name: "Month", key: "", type: "INT", role: "Metric Σ" },
          { name: "MonthName", key: "", type: "VARCHAR(15)", role: "Attribute" },
          { name: "Quarter", key: "", type: "VARCHAR(10)", role: "Attribute" },
          { name: "Year", key: "", type: "INT", role: "Metric Σ" }
        ]
      },
      {
        id: "Dim_Product",
        name: "Dim_Product",
        type: "dim",
        icon: "ph-cube",
        pos: { x: 960, y: 320 },
        columns: [
          { name: "Brand", key: "", type: "VARCHAR(50)", role: "Flattened Attr" },
          { name: "Category", key: "", type: "VARCHAR(60)", role: "Denormalized Level" },
          { name: "Department", key: "", type: "VARCHAR(60)", role: "Denormalized Level" },
          { name: "ProductID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "ProductName", key: "", type: "VARCHAR(100)", role: "Attribute" },
          { name: "Subcategory", key: "", type: "VARCHAR(60)", role: "Denormalized Level" }
        ]
      },
      {
        id: "Dim_Customer",
        name: "Dim_Customer",
        type: "dim",
        icon: "ph-users-three",
        pos: { x: 590, y: 680 },
        columns: [
          { name: "City", key: "", type: "VARCHAR(50)", role: "Attribute" },
          { name: "CustomerID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "CustomerName", key: "", type: "VARCHAR(100)", role: "Attribute" },
          { name: "Province", key: "", type: "VARCHAR(50)", role: "Attribute" },
          { name: "Segment", key: "", type: "VARCHAR(30)", role: "Attribute" }
        ]
      },
      {
        id: "Dim_Store",
        name: "Dim_Store",
        type: "dim",
        icon: "ph-storefront",
        pos: { x: 140, y: 360 },
        columns: [
          { name: "Manager", key: "", type: "VARCHAR(60)", role: "Attribute" },
          { name: "Region", key: "", type: "VARCHAR(40)", role: "Attribute" },
          { name: "StoreID", key: "PK", type: "INT", role: "Primary Key" },
          { name: "StoreName", key: "", type: "VARCHAR(60)", role: "Attribute" }
        ]
      }
    ],
    relationships: [
      { from: "Dim_Date", fromKey: "DateKey", to: "Fact_Sales", toKey: "OrderDateKey", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Product", fromKey: "ProductID", to: "Fact_Sales", toKey: "ProductID", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Store", fromKey: "StoreID", to: "Fact_Sales", toKey: "RushFlag", cardFrom: "1", cardTo: "*" },
      { from: "Dim_Customer", fromKey: "CustomerID", to: "Fact_Sales", toKey: "CustomerID", cardFrom: "1", cardTo: "*" }
    ]
  }
};

