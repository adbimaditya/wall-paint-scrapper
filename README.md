# 🎨 Wall Paint Color Palette Scraper

A Playwright-powered web scraper that extracts official color palettes from major wall paint brands like Nippon Paint and Dulux. The scraper collects essential color information, including:​

- **Name**: The official color name.
- **Code**: The brand-specific identifier for the color.
- **Hex Code**: The hexadecimal color representation.

## 📦 Example Output

The extracted data is structured in JSON format as follows:​

```json
{
  "id": "e24f847c-c197-4c54-b1ed-1dbf2f4d91ea",
  "name": "Air Breeze",
  "code": "9436",
  "hexCode": "#F3EDE8"
}
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 14 or higher)
- [npm​](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/adbimaditya/wall-paint-scrapper.git
   ```

   ```bash
   cd wall-paint-scrapper
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

## 🛠️ Usage

To run the scraper:​

```bash
npm run dev
```

The script will navigate to the specified paint brand websites, extract the color palettes, and save them into JSON files within the `data` directory.

## 🧱 Supported Brands

- Asian Paints
- Avian Brands
- Dulux
- Jotun
- Nippon Paint

_​Note: The scraper is designed to be extensible. You can add support for more brands._
