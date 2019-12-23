function makeFoldersArray() {
    return [
        { 
            id: 1, 
            folder_name: "test folder 1"
        },
        { 
            id: 2, 
            folder_name: "test folder 2"
        },
        { 
            id: 3, 
            folder_name: "test folder 3"
        },
    ];
}

function makeMaliciousFolder() {
    const maliciousFolder =
    {
      id: 9,
      name: 'Malice malice malice <script>alert("xss");</script>'
    }
  
    const expectedFolder =
    {
      id: 9,
      name: 'Malice malice malice &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    }
  
    return maliciousFolder, expectedFolder;
  };

module.exports = {
    makeFoldersArray,
    makeMaliciousFolder
};