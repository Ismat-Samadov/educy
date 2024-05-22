# Regression Models for Life Expectancy Prediction

This project implements and compares various regression models to predict life expectancy using the "Life Expectancy Data" dataset. The models used include Linear Regression, Random Forest, Support Vector Regressor (SVR), XGBoost, LightGBM, CatBoost, and Stacking Regressor. The project also includes hyperparameter optimization using Optuna for the models (except Linear Regression) and univariate analysis of the best performing model.

## Project Structure

```
.
├── data
│   ├── Life Expectancy Data.csv
├── notebooks
│   ├── Regression_Modells.ipynb
├── requirements.txt
└── README.md
```

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Ismat-Samadov/Regression_Modells.git
    cd Regression_Modells
    ```

2. Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

## Dataset

The dataset used in this project is the "Life Expectancy Data". The dataset contains various health, demographic, and economic features that might influence life expectancy. The target variable is 'Life expectancy'.

## Notebook

The Jupyter notebook `Regression_Modells.ipynb` contains the following steps:

1. **Data Loading and Initial Inspection**: 
    - Load the dataset and inspect the data structure.

2. **Pre-processing for Regression**: 
    - Handle missing values.
    - Encode categorical variables.
    - Scale numerical features.
    - Split the data into training and testing sets.

3. **Model Implementation**: 
    - Implement and evaluate the following models with their default parameters:
        - Linear Regression
        - Random Forest
        - Support Vector Regressor (SVR)
        - XGBoost
        - LightGBM
        - CatBoost
        - Stacking Regressor

4. **Optimization with Optuna**: 
    - Optimize hyperparameters for each model using Optuna (except Linear Regression).

5. **Evaluation and Results Compilation**: 
    - Compile the results into a DataFrame for easy comparison.

6. **Univariate Analysis of Best Model**: 
    - Perform univariate analysis on the best model and, if necessary, reduce the number of features.

## Usage

To run the notebook:

1. Open the notebook in Jupyter:
    ```bash
    jupyter notebook notebooks/Regression_Modells.ipynb
    ```

2. Execute the cells in the notebook to load the data, preprocess it, implement the models, optimize them, and perform univariate analysis on the best model.

## Results

The results of the models are compiled into a DataFrame for easy comparison. The evaluation metrics used include Mean Squared Error (MSE) and R2 Score.

## Contributing

Contributions are welcome! Please create a pull request or open an issue to discuss any changes or improvements.