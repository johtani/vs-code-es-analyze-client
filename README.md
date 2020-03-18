# elasticsearch-analyze-api-client README

The client extension for [Elasticsearch Analyze API](). The client provides viewer of Analyze API Response. The API response is JSON, but it is hard to 

## Features

* Send Analyze Request in editor and view response in another editor with webview
  * Parameters can be set in the file that has `.analyze` extension.
* Create `.analyze` file from template

## Usage

1. Open "Command Pallete", use 'Create Elasticsearch Analyze Request' command. Plugin open text editor with 4 parameter names.
2. Set following parameters in editor. All parameters are required.
   1. host - Elasticsearch host. "http://localhost:9200"
   2. indexName - Index name that contains the field you want to analyze.
   3. analyzerNames - A list of analyze names. It can be specified 1 or more analyzers. e.g. `["kuromoji", "standard"]`
   4. text - Target text of analyze API.

3. Click gray text `Analyze text with analyzers` in editor. So the plugin calls Analyze API with your parameters, then open the response of Analyze API in another column.

## Known Issues

None.

## Release Notes

### 0.1.0

Initial release

## LICENSE

See LICENSE file.
