import json
from collections import Counter

# A sample dataset represented as a JSON string.
SAMPLE_DATA = """
[
  {"id": 1, "name": "Alice", "role": "engineer", "age": 32, "city": "New York"},
  {"id": 2, "name": "Bob", "role": "designer", "age": 28, "city": "London"},
  {"id": 3, "name": "Charlie", "role": "engineer", "age": 45, "city": "New York"},
  {"id": 4, "name": "Diana", "role": "manager", "age": 38, "city": "Tokyo"},
  {"id": 5, "name": "Eve", "role": "designer", "age": 31, "city": "London"},
  {"id": 6, "name": "Frank", "role": "engineer", "age": 29, "city": "Tokyo"}
]
"""

class DataAnalyzer:
    """A utility class to perform basic analysis on a user dataset."""

    def __init__(self, json_data):
        """Initializes the analyzer with data."""
        self.dataset = self.load_data(json_data)

    @staticmethod
    def load_data(json_data):
        """Loads data from a JSON string into a list of dictionaries."""
        try:
            return json.loads(json_data)
        except json.JSONDecodeError:
            print("Error: Invalid JSON data provided.")
            return []

    def get_record_count(self):
        """Returns the total number of records in the dataset."""
        return len(self.dataset)

    def calculate_average_age(self):
        """Calculates the average age of all users in the dataset."""
        if not self.dataset:
            return 0
        total_age = sum(record.get('age', 0) for record in self.dataset)
        return total_age / self.get_record_count()

    def get_role_distribution(self):
        """Counts the number of users in each role."""
        if not self.dataset:
            return {}
        roles = [record.get('role', 'N/A') for record in self.dataset]
        return dict(Counter(roles))

    def filter_by_city(self, city_name):
        """Filters the dataset to find all users in a specific city."""
        return [
            record for record in self.dataset
            if record.get('city', '').lower() == city_name.lower()
        ]

    def display_summary(self):
        """Prints a summary of the data analysis."""
        print("--- Data Analysis Summary ---")
        print(f"Total Records: {self.get_record_count()}")
        print(f"Average Age: {self.calculate_average_age():.2f}")
        print("\nRole Distribution:")
        for role, count in self.get_role_distribution().items():
            print(f"  - {role.capitalize()}: {count}")

        print("\nEngineers in New York:")
        ny_engineers = [
            p['name'] for p in self.filter_by_city('New York')
            if p.get('role') == 'engineer'
        ]
        print(f"  - {', '.join(ny_engineers)}")
        print("---------------------------")


def main():
    """Main function to instantiate and run the analyzer."""
    analyzer = DataAnalyzer(SAMPLE_DATA)
    analyzer.display_summary()


if __name__ == "__main__":
    main()