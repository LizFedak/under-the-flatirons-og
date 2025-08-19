async function executeCode() {  
  dmAPI.loadScript('https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js', function() {
      dmAPI.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pluralize/8.0.0/pluralize.min.js', function() {
          dmAPI.loadScript('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js', function() {           
          let LOCALE = checkNull(data.config.locale) !== "" ? data.config.locale : "en-US";
          // SETS DEFAULT TO "GET DIRECTIONS" IF NOT ENTERED
          const DIRECTIONS_TEXT = checkNull(data.config.DIRECTIONS_TEXT) !== "" ? data.config.DIRECTIONS_TEXT : "GET DIRECTIONS"
          // SETS DEFAULT TO 10 IF NOT SELECTED
          const page = !isNaN(parseInt(data.config.page)) ? parseInt(data.config.page) : 10;
          // SETS DEFAULT TO 'true' IF NOT ENTERED
          // DEFAULTS TO 100 IF UNSET IN THE CONTENT TAB
          let truncatedTo = !isNaN(parseInt(data.config.truncatedLength)) ? parseInt(data.config.truncatedLength) : 100;
        
      // generate a list of the filters that are being used.
      let fieldNumbersInPlay = [];
      fieldIDs.forEach(num => {
          if (data.config[`addFilter${num}`]) {
              fieldNumbersInPlay.push(num)
          }
      })
      let labels = fieldNumbersInPlay.map(idNumber => {
          let optionLabel = `filterOptions${idNumber}`;
          let label = checkNull(data.config[`filterLabel${idNumber}`]) !== "" ? data.config[`filterLabel${idNumber}`] : "DEFINE IN CONTENT TAB";
          let id = `filterLabel${idNumber}`;
          return new Label(idNumber, id, label,optionLabel)
      })
  
      function Label(idNumber, id, label,optionLabel) {
          this.idNumber = idNumber;
          this.id = id;
          this.single = label;
          // uses pluralize.js library
          this.plural = pluralize(label);
          this.optionLabel = optionLabel;
      }
      Label.prototype.getSingle = function() {
          return this.single;
      }
      Label.prototype.getPlural = function() {
          return this.plural;
      } 
  function generateAddressLine(street1, street2, street3, city, state, zip, country, destination) {
    let order = data.config.orderNumberfieldaddress;
  
    street1 = checkNull(street1);
    street2 = checkNull(street2);
    street3 = checkNull(street3);
    city = checkNull(city);
    state = checkNull(state);
    zip = checkNull(zip);
    country = checkNull(country);

      const addressBlockClass = data.config.addressIconcheck ? "addressBlock Icon" : "addressBlock";
      const metadataIcon = data.config.addressIconcheck ? `<div class="metadataIcon">${data.config.addressIcon}</div>` : "";
      const addressRight = data.config.addressIconcheck ? `<div class="addressright">` : "";
      const closingAddressRight = data.config.addressIconcheck ? '</div>' : '';
      const streetAddress = `<div class="streetAddress">${street1}</div>`;
      const secondStreetAddress = street2 ? `<div class="streetAddress">${street2}</div>` : "";
      const thirdStreetAddress = street3 ? `<div class="streetAddress">${street3}</div>` : "";
      const addressLine = `<div class="addressLine">${city ? `${city}, ` : ""}${state} ${zip}</div>`;
      const countryDiv = country ? `<div class="country">${country}</div>` : "";
      const addressString = `<div class="${addressBlockClass}" style="order: ${order};">${metadataIcon}${addressRight}${streetAddress}${secondStreetAddress}${thirdStreetAddress}${addressLine}${countryDiv}${closingAddressRight}</div>`;
      const closingDivCount = (addressString.match(/<\/div>/g) || []).length;
      const openingDivCount = (addressString.match(/<div/g) || []).length;
      const divDifference = openingDivCount - closingDivCount;
      const missingClosingDivs = '</div>'.repeat(divDifference);
      return addressString + missingClosingDivs;
  }
  
      function generateLink(value, type, order) {
          let link;
          if (checkNull(value) !== "") {
            link = `<div class="mapLink ${type}"><a href="${value}">${value}</a></div>`
            return link
            } else {
              return ""
          }
      }
      function getDirectionsLink(business_name, address1, address2, city, state, zip, country, FORMAP) {
          // FORMAP IS PASSED AS TRUE IF THE CALL TO THIS FUNCTION IS FOR THE MAP POP UP
          if (data.config.showGetDirections || FORMAP) {
              // /3116+Heidelberg+Dr,+Boulder,+CO+80305t
              let values = [address1, address2, city, state, String(zip), country]
              if (data.config.ADDTITLETODIRECTIONS) {
                  values.unshift(business_name)
              }
              let baseURL = "https://www.google.com/maps/dir//"
              values = values.map(x => {
                  
                  if (checkNull(x) !== "" && x !== "undefined") {
                      return x.replaceAll(" ", "+")
                  } else {
                      return ""
                  }
              }).filter(item => item !== null && item !== "" && item !== "undefined" && item !== undefined)
              
              if (values.length > 1 && !FORMAP) { 
                  let str = `${baseURL}${values[0]}+${values[1]}+${values[2]}+${values[3]}+${values[4]}+${values[5]}+${values[6]}`.replaceAll("+undefined","")
                  return `<div class="mapLink" style="order: ${data.config.orderBTN};"><a href="${str}">${DIRECTIONS_TEXT}</a></div>`
              } else if (values.length > 1 && FORMAP) {
                  let str = `${baseURL}${values[0]}+${values[1]}+${values[2]}+${values[3]}+${values[4]}+${values[5]}+${values[6]}`.replaceAll("+undefined","")
                  return `<div class="quickLinkContainer"><div class="mapLink getDirectionsContainer" style="order:0;"><a href="${str}">${data.config.getDirectionsICON}</a></div><div style="order:1;" class="quickLinkText">Directions</div></div>`
              } else {
                  return ""
              }
          } else {
              return ""
          }
      }
      function scrollUp() {
          window.scrollTo({ top: 200, behavior: 'smooth' });
      }
      function getFieldType(num) {
          // num can only come from 'fieldnumbersinplay' array so this will always either be one of the 2 options with no fail criteria
              return data.config[`filterType${num}`]
          
      }
      function processMultipleSelect(values) {
          if (values !== undefined && values !== null) {
              return values.split(",").map(x => x.trim()).filter(x => x !== null && x !== undefined && x !== "")
          } else {
              return []
          }
      }

      function generateSelectOptions(BASEVALUESARRAY, field, type, num) {
          let VALTRACKER = [];
          
         
              BASEVALUESARRAY.forEach(item => {
                  if (item[field] !== null && item[field] !== undefined && Array.isArray(item[field])) {
                      item[field].forEach(x => {
                          if (checkNull(x) !== "" && !VALTRACKER.includes(x)) {
                              VALTRACKER.push(x)
                          }
                      })
                      return item[field]
                  } else if (checkNull(item[field]) !== "" && typeof item[field] === "string") {
                      if (!VALTRACKER.includes(item[field])) {
                          VALTRACKER.push(item[field])
                      }
                  }
              })
              let title = data.config[`filterLabel${num}`]
              if (type === 'singleSelect') { 
                  VALTRACKER.unshift(title)
              }
          
          return {type: type, values: VALTRACKER}
      }
      function checkNull(val) {
          if (val !== undefined && val !== null) {
              return val
          } else {
              return ""
          }
      }

      
      function processDisplayValue(content,num,type,lb) {
          let icon = `${data.config[`checkbox${num}`] && data.config[`icon${num}`] !== undefined &&  data.config[`icon${num}`] !== null ? `<div class="contentIcon">${data.config[`icon${num}`]}</div>` : ""}`
          // LABEL is not added to checkbox as it is actually showing the LABEL as the checkbox value
          let label = data.config.showLabels ? `<span class="contentLabel">${data.config[`filterLabel${num}`]}${type !== "checkbox" ? ":" : ""} </span>` : "";
          let getCBnum = parseInt(num) + 8;
          if (!content) {
              return ""
          } else if (type === "checkbox" && content) {
              return `<div class="contentDisplay field${num}" style="order: ${data.config[`orderNumberfield${num}`]};">${icon}${lb}</div>`
          } else if (type === "cbtags" && content) {
              let tags = `<div class="tag">${lb}</div>`
              return `<div class="tags contentDisplay field${num}" style="order: ${data.config[`orderNumberfield${num}`]};">${icon}${tags}</div>`
          } else if (type === "tags" && Array.isArray(content) && content.length > 0) {
          let tags = icon + content.map(tag => {
              let tagClass = checkNull(tag) !== "" ? tag.replaceAll(/[^a-zA-Z0-9]*/g, "") : "";
              let tagLabel = getURLParamLabel(num); // Get the tag label using the `num` value
              let tagValue = tag; // Use the tag as the tag value
              let tagLink = data.config.makeTagsBeLinks ? (data.config.tagPageToOpen + `?${encodeURIComponent(tagLabel)}=${encodeURIComponent(tagValue)}`) : ''; // Create the tag link if `makeTagsBeLinks` is true
              let tagContent = data.config.makeTagsBeLinks ? `<a href="${tagLink}">${tagValue}</a>` : tagValue; // Wrap the tag value in a link if `makeTagsBeLinks` is true
              return `<div class="tag ${tagClass}">${tagContent}</div>`;
          }).join("");
          return `<div class="tags contentDisplay field${num}" style="order: ${data.config[`orderNumberfield${num}`]};">${tags}</div>`;
   
          } else if (type === "multipleSelect" && content.length > 0 && data.config.makeTagsBeLinks) {
           
          let tags = icon + content.map(tag => {
              let tagClass = checkNull(tag) !== "" ? tag.replaceAll(/[^a-zA-Z0-9]*/g, "") : "";
              let tagLabel = getURLParamLabel(num); // Get the tag label using the `num` value
              let tagValue = tag; // Use the tag as the tag value
              let tagLink = data.config.makeTagsBeLinks ? (data.config.tagPageToOpen + `?${encodeURIComponent(tagLabel)}=${encodeURIComponent(tagValue)}`) : ''; // Create the tag link if `makeTagsBeLinks` is true
              let tagContent = data.config.makeTagsBeLinks ? `<a href="${tagLink}">${tagValue}</a>` : tagValue; // Wrap the tag value in a link if `makeTagsBeLinks` is true
              return `<div class="msItem ${tagClass}">${tagContent}</div>`;
          }).join("");
          return `<div class="msItems contentDisplay field${num}" style="order: ${data.config[`orderNumberfield${num}`]};">${tags}</div>`;
   
          } else if (type !== "checkbox" && type !== "cbtags" && type !== "multipleSelectPAIRED" && checkNull(content) !== "" && !(Array.isArray(content) && content.length === 0)) {
              return `<div class="contentDisplay field${num}" style="order: ${data.config[`orderNumberfield${num}`]}">${icon}${label}<div class="contentText">${content}</div></div>`
          } else if (type === "multipleSelectPAIRED") {
              return `<div class="contentDisplay field${num}" style="order: ${data.config[`orderNumberfield${num}`]}">${icon}${label}<div class="contentText">${content[0]}${content[1] !== "" && content[1] !== undefined && content[1] !== null ? ">" + content[1] : "" }</div></div>`
          } else {
              return ""
          }
      }
      
      function generateImage(values) {
          let order;
          if (data.config.layout === "grid" && data.config.contentOrderLayout === "titleAboveImage") {
              order = 1;
          } else if (data.config.layout === "grid" && data.config.contentOrderLayout === "imageAboveTitle") { 
              order = 0;
          } else {
              order = 0;
          }
          if (data.config.imagecheck && checkNull(values.image) !== "") {

              let template = `<figure style="order: ${order}; position:relative; ${data.config.hoverStyle === "ZOOMIN" || data.config.hoverStyle === "none" ? 'overflow:hidden;' : ''}" class="imageFigure ${data.config.hoverStyle === 'overlayText' ? 'container' : ''}">
               <img ${data.config.hoverStyle === "ZOOMIN" ? "class='ZOOMIN reallylazy'" : "class='reallylazy'"} style="object-fit: ${data.config.imageStyle};" src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'  data-src="${values.image}" alt="${values.alt}" data-idx="${values.itemID}"/>
             
              </figure>`
              return template;
          } else {
              return ""
          }
      }


      function generateHours(values) {
          let hours =  `<div class="hours">
                  ${checkNull(values.monday) !== "" ? `<div class="hours">Monday: ${values.monday}</div>` : "" }
                  ${checkNull(values.tuesday) !== "" ? `<div class="hours">Tuesday: ${values.tuesday}</div>` : "" }
                  ${checkNull(values.wednesday) !== "" ? `<div class="hours">Wednesday: ${values.wednesday}</div>` : "" }
                  ${checkNull(values.thursday) !== "" ? `<div class="hours">Thursday: ${values.thursday}</div>` : "" }
                  ${checkNull(values.friday) !== "" ? `<div class="hours">Friday: ${values.friday}</div>` : "" }
                  ${checkNull(values.saturday) !== "" ? `<div class="hours">Saturday: ${values.saturday}</div>` : "" }
                  ${checkNull(values.sunday) !== "" ? `<div class="hours">Sunday: ${values.sunday}</div>` : "" }
                 </div>`
          return hours
      }

      function checkIfThereIsAnythingToShow(obj) {
          let valsToCheck, isHours;
          if (data.config.linkDisplayStyle === "btn") {
             valsToCheck = "link1,filterValues1HTML,filterValues2HTML,filterValues3HTML,filterValues4HTML,filterValues6HTML,filterValues7HTML,filterValues8HTML".split(",")
          } else {
              valsToCheck = "filterValues1,filterValues2HTML,filterValues3HTML,filterValues4HTML,filterValues6HTML,filterValues7HTML,filterValues8HTML".split(",")
          }
          if (data.config.showHours === "simpleHours") {
              isHours = checkNull(obj.simpleHours) !== "";
          } else if (data.config.showHours === "fullHours") {
              isHours = "sunday,monday,tuesday,wednesday,thursday,friday,saturday".split(",").some(x => obj[x] !== null && obj[x] !== undefined && obj[x] !== "" && obj[x] !== false)
          } else {
              isHours = false;
          }
          let count = 0;
          valsToCheck.forEach(x => {
              if (obj[x] !== null && obj[x] !== undefined && obj[x] !== "") {
                  count += 1;
              }
          })
          if (isHours) {
              count += 1;
          }
          return count > 0
      }


      function buildAuthorBar(obj) {
          let template;
          let byline = checkNull(data.config.authorByLine) !== "" ? `${data.config.authorByLine}: ` : "";
          let authorName = checkNull(obj.authorName)
          let authorURL = checkNull(obj.authorURL)
          /* LOGIC: 
          CHECKS FOR NAME AS A REQUIREMENT TO MOVE ON.
          CHECKS IF THERE IS ACTUALLY A LINK AND WILL USE A LINK-LESS LAYOUT IF NO LINK IS PROVIDED. OTHERWISE USES SELECTED LAYOUT.*/
          if (authorName === "") {return ""}
          if (data.config.authorBarStyle === "imageNameLink" && authorURL !== "") {
              template = `<a class="authorURL" href="${obj.authorURL}" style="order: ${data.config.authorBarOrder};"><div class="authorBar">
              <div class="authorImage"><img class="authorImage" src="${obj.authorImage}"></div>
            <div class="authorName">${byline}${obj.authorName}</div></div></a>`
          } else  if (data.config.authorBarStyle === "imageName" || (data.config.authorBarStyle === "imageNameLink" && authorURL === "")) {
              template = `<div class="authorBar" style="order: ${data.config.authorBarOrder};">
              <div class="authorImage"><img class="authorImage" src="${obj.authorImage}"></div>
            <div class="authorName">${byline}${obj.authorName}</div></div>`
          } else if (data.config.authorBarStyle === "nameLink" && authorURL !== "") {
              template = `<a class="authorURL" href="${authorURL}" style="order: ${data.config.authorBarOrder};"><div class="authorBar">
              <div class="authorName">${obj.authorName}</div></div></a>`
          } else if (data.config.authorBarStyle === "nameOnly" || (data.config.authorBarStyle === "nameLink" && authorURL === "")) {
              template = `<div class="authorBar" style="order: ${data.config.authorBarOrder};">
              <div class="authorName">${byline}${obj.authorName}</div></div>`
          } else if (data.config.authorBarStyle === "none") {
              template = ""
          } else {
              template = ""
          }
          return template
      }
      
      
      function checkInt(zindex) {
        const parsedInt = parseInt(zindex, 10);
        
        if (isNaN(parsedInt)) {
          return 0;
        } else {
          return parsedInt;
        }
      }
      function generateUsableData(item, index) {
          // THIS FUNCTION RETURNS "OBJECT" AND ITERATES OVER THE INPUT TO PROCESS THE DATA INTO A USABLE/PROCESSABLE FORMAT. AN ID IS ADDED BASED ON THE INDEX.
          // LOTS OF FUNCTIONS ARE USED TO PROCESS THE DATA.
          let keys = ['customBgClass','streetAddress1','streetAddress2','streetAddress3','city','state','zipcode','title','subtitle','city']
          let obj = item;
          obj.randomInt = Math.floor(Math.random() * 1000) + 1;
          obj.customBgClass = checkNull(obj.customBgClass) !== "" ? checkNull(obj.customBgClass) : "customBGClass";
          obj.itemID = index;
          obj.id = index;
          obj.zindex = checkInt(item.zindex) 
          obj.hoursHTML = generateHours(item)
          obj.distance = 0;
          obj.authorBarHTML = buildAuthorBar(obj)
          obj.datasort0 = checkNull(obj.city)
          fieldNumbersInPlay.forEach(num => {
              let type = getFieldType(num)
              switch (type) {
                  case "multipleSelect":
                      obj[`filterValues${num}`] = processMultipleSelect(obj[`filterValues${num}`]);
                      obj[`filterValues${num}HTML`] = processDisplayValue(obj[`filterValues${num}`],num, "multipleSelect");
                      obj[`datasort${num}`] = null;
                      break;

                  case "dateRange":
                      let date = obj[`filterValues${num}`];
                      if (checkNull(date) !== "") {
                          let icon = `${data.config[`checkbox${num}`] && data.config[`icon${num}`] !== undefined &&  data.config[`icon${num}`] !== null ? `<div class="contentIcon">${data.config[`icon${num}`]}</div>` : ""}`
                          // make safari safe!
                          date = date.replace(/-/g, "/")
                          let mnt = moment(date)
                    
                          let jsDate = mnt.toDate();
                        
                          let sortDate = jsDate.getTime();
                      
                          let prettyDate = jsDate.toLocaleDateString(LOCALE);
                          let prettyTime = jsDate.toLocaleTimeString(LOCALE, {timeStyle: "short"});
                          let label = data.config.filterLabel1 + ": ";
                          obj[`filterValues${num}`] = {original: date, value: jsDate, sort: sortDate, prettyTime: prettyTime, prettyDate:prettyDate, label: label }
                          obj[`filterValues${num}HTML`] = `<div class="time contentDisplay" style="order:${data.config.orderTime};">${icon}${data.config.showLabels ? label : ""}${obj[`filterValues${num}`].prettyDate}</div>`;
                          obj[`datasort${num}`] = sortDate;
                      } else {
                          obj[`filterValues${num}`] = "";
                          obj[`filterValues${num}HTML`] = "";
                          obj[`datasort${num}`] = 0;
                      }
                      break;
                  default:
                      console.log(`Something is not correct in your settings for Field ${num}. Please report this issue to your admin.`)
                      obj[`filterValues${num}HTML`] = "";
                      break;
              }

          })

          keys.forEach(key => {
              // THIS VERIFIES EACH KEY ITEM IS NOT NULL OR SETS IT TO A BLANK STRING IF SO. 
              obj[key] = checkNull(obj[key])
          })
          obj.addressHTML = generateAddressLine(obj.streetAddress1, obj.streetAddress2, obj.streetAddress3, obj.city, obj.state, obj.zipcode, "")

          obj.imageHTML = generateImage(obj)
          if (data.config.hoverStyle === "overlayText") {
              obj.outerHoverEffect = true
          } else {
              obj.outerHoverEffect = false
          }
          
          obj.imageHTMLACC = checkNull(obj.image) !== "" ? `<img style="object-fit: ${data.config.imageStyle};" class="smallImage" src="${obj.image}">` : "";

          if (data.config.emailCheck && checkNull(obj.emailA) !== "") {
              obj.emailLink = generateLink(obj.emailA, 'email', data.config.emailLinkOrder);
          }  else {
              obj.emailLink = ""
          }

          obj.directionsLink = getDirectionsLink(obj.title, obj.streetAddress1, obj.streetAddress2, obj.city, obj.state, obj.zip, obj.country)
          
          if (data.config.displayDescription) {
              obj.descriptionPopup = checkNull(obj.description)
              obj.description = checkNull(obj.description)
              if (obj.description !== "" && data.config.USETRUNCATED) {
                  obj.isLong = obj.description.length > truncatedTo;
                  obj.truncatedDescription = getTruncated(obj.description);
                  obj.description = `<div class="description" style="display: none; order: ${data.config.orderNumberfieldDESCRIPTION};">${obj.description}</div>`;
              } else if (obj.description !== "") {
                  obj.description = `<div class="description" style="order: ${data.config.orderNumberfieldDESCRIPTION};">${obj.description}</div>`;
                  obj.truncatedDescription = "";
                  obj.isLong = false;
              } else {
                  obj.description = "";
                  obj.isLong = false;
                  obj.truncatedDescription = "";
              }
          } else {
              obj.description = "";
              obj.isLong = false;
              obj.truncatedDescription = "";
          }
          if (data.config.layout === "accordion") {
              obj.hasValsToShow = checkIfThereIsAnythingToShow(obj)
          }
          return obj
      }
      function getTruncated(content) {
          // THIS IS ALWAYS PASSED A LEGITIMATE VALUE OR NOT CALLED.
          // TRUNCATEDTO IS SET TO 100 IF A NAN VALUE IS PASSED IN.
          // READMORE CAN BE BLANK SO checkNull does not have an alternate value!
          let len = content.length;
          let READMORE = checkNull(data.config.READMORE);
          if (data.config.USETRUNCATED && truncatedTo < len) {
              return `<div class="truncatedDesc" style="order: ${data.config.orderNumberfieldDESCRIPTION};">${content.substring(0, truncatedTo)}...${data.config.layout === "accordion" ? `<span class="readMore" style="color:${data.config.READMORECOLOR};">${READMORE}</span>` : ""}</div>`
          } else {
              return `<div class="truncatedDesc" style="order: ${data.config.orderNumberfieldDESCRIPTION};">${content}</div>`
          }
      }
      function addMC(categories, field, type, category, num) {
          if (!data.config[`overrideFilter${num}`] && data.config.alphabetizeOptions) {
              categories = categories.sort()
          }
          
          let innerHTMLTemplate = `
              <div class="list-expand slideToggle subcategory">
                  <div class='dropdownTop'>
                      <span class="subcategoryLabel">${data.config[`filterLabel${num}`]}</span>
                  </div>
                  
              </div>
              <div class="types ${data.config.FILTERLOCATION !== "SIDEBARNODROPDOWN" ? "slideList" : ""} subcategoryList" ${data.config.FILTERLOCATION !== "SIDEBARNODROPDOWN" ? 'style="display: none;"' : ""}>
                  <div class='filters ${type} ${field}'>
                  </div>
              </div>`
          // THIS .groupContainer.${field} FIELD IS ADDED IN THE HTML ALREADY SO IT WILL NOT FAIL.
          let divToBuild = $(element).find(`.groupContainer.${field}`).html(innerHTMLTemplate)
          // NEXT IS SELECTED FROM CODE ADDED VIA THE TEMPLATE INJECTION.
          categoryOptionsContainer = $(element).find(`.subcategoryList .${field}`)
          if (Array.isArray(categories) && categories.length > 0) {
              
              
              categories.forEach((x,i) => {
                  if (x === null || x === undefined || x === "") { return } // DONT ADD ANYTHING FOR THIS ITERATION IF NULL, UNDEFINED, OR EMPTY STRING
                  let name = x.replaceAll(/[^a-zA-Z0-9]*/g, "").toLowerCase();
                  let customID = (name.concat("id", num)).toLowerCase();
                  if (customID === `id${num}`) {
                      customID = "X".repeat(i) + String(i) + String(num); // MAKE SURE THE ID IS UNIQUE AND LEGAL. USE CASE IF DISPLAY VALUE IS "$" and "$$"
                  }
                  let div = document.createElement('div');
                  div.classList.add('item');
                  let inp = document.createElement('input');
                  inp.classList.add(`magic-${type}`);
                  if (type === 'checkbox') {
                      inp.classList.add('default')
                  }
                  if (type === "radio") {
                      inp.name = field;
                  }
                  inp.classList.add('filter');
                  inp.type = type;
                  inp.value = x;
                  inp.id = customID;
                  // inp.setAttribute("name", customID)
                  inp.dataset.category = field;
                  inp.dataset.master = category;
                  let label = document.createElement('label');
                  label.classList.add("magicLabel");
                  label.innerText = x;
                  label.setAttribute('for', customID)
                  div.append(inp);
                  div.append(label);
                  categoryOptionsContainer.append(div);
              }) // end of categories.forEach
          } else {
              console.log(`ADD SOME OPTIONS FOR THIS CATEGORY BY CONNECTING YOUR DATA TO THE FILTER VALUE COLUMN FOR FIELD: ${field}`)
              return
          }
      }

      function generateDOMelementOptions(vals) {
          let obj = {};
          fieldNumbersInPlay.forEach(num => {
              let type = getFieldType(num)
              switch (type) {
                  case "multipleSelect":
                      obj[`filterOptions${num}`] = generateSelectOptions(vals, `filterValues${num}`, type, num);
                      break;
                  case "dateRange":
                      obj[`filterOptions${num}`] = {type: "dateRange", label: checkNull(data.config[`filterLabel${num}`])}
                      break;
                  default:
                      return ""
              }
          })
          return obj
      }
      function generateDOMElements(vals) {
          let keys = Object.keys(vals)
          keys.forEach((key, idx) => {
              let option = vals[key];
              let num = key[key.length - 1] // GETS THE NUMBER FROM THE LAST CHARACTER OF THE KEY WHICH IS A NUMBER 1-9!
              
            let values = option.values;
            addMC(values, key, 'checkbox', 'checkbox', num)
              
          })
      }
      function Filters(vals) {
          let keys = Object.keys(vals)
          keys.forEach((key, idx) => {
              let num = key[key.length - 1]
              let option = vals[key]
              if (option.type === 'multipleSelect' || option.type === "multipleSelectPAIRED") {
                  this[key] = { type:'multipleSelect', value:[], f: this.categoryIsTrueList , itemKey: `filterValues${num}`}
              } else if (option.type === 'dateRange') {
                  this[key] = {type: "dateRange", start: null, end: null, f:this.dateIsTrue, itemKey: `filterValues${num}`};
              }
          })
      }
      Filters.prototype.parseSpecificTypeForValues = function(type, values, field) {
          if (checkNull(values) === "") { return }
          let vals, start, end;
          switch (type) {
              case "multipleSelect":
                  values = values.split(",");
                  this[field].value = values;
                  break;
              case "dateRange":
                  vals = values.split("to")
                  start = vals[0]
                  end = vals[1]
                  this[field].start = start;
                  this[field].end = end;
                  break;
              default:
                  break;
          }
      }
      Filters.prototype.pageLoadSelectInTheDOM = function(type, values, field, key, ID_NUMBER) {
          let min, max, start, end, vals;
          switch (type) {
              
              case "multipleSelect":
                  values.split(",").forEach(val => {
                      $(element).find(`.filterOptions${ID_NUMBER} input[value="${val}"]`).prop( "checked", true );
                  })
                  break;
              
              case "dateRange":
                  vals = values.split("to")
                  min = vals[0]
                  max = vals[1]
                  let startObj = new Date(parseInt(min))
                  let endObj = new Date(parseInt(max))
                  let startDate = `${startObj.getFullYear()}-${String(startObj.getMonth() + 1).padStart(2, '0')}-${String(startObj.getDate()).padStart(2, '0')}`;
                  let endDate = `${endObj.getFullYear()}-${String(endObj.getMonth() + 1).padStart(2, '0')}-${String(endObj.getDate()).padStart(2, '0')}`
                  $(document).find("#rangeDate").val(`${startDate} to ${endDate}`)
                  break;
              default:
                  break;
          }
      }
      Filters.prototype.handleLoadSearch = function(searchTerm) {
          document.querySelector('input#autoComplete').value = searchTerm;
      }
      Filters.prototype.pageLoadURLStringParser = function() {
              const queryString = window.location.search;
              const urlParams = new URLSearchParams(queryString);
              // uses urlParams method `entries()` to iterate through all entries in the order that they appear
              for (const [key, value] of urlParams.entries()) {
                  
                  if (key === "searchTerm") {
                      this.handleLoadSearch(value)
                  } else {
                      const MATCH = labels.find(label => label.single === key)
                      if (MATCH) {
                          const ID_NUMBER = MATCH.idNumber;
                          const TYPE = this[`filterOptions${ID_NUMBER}`].type
                          this.parseSpecificTypeForValues(TYPE, value, `filterOptions${ID_NUMBER}`)
                          this.pageLoadSelectInTheDOM(TYPE, value, `filterOptions${ID_NUMBER}`, key, ID_NUMBER)
                      }
                  }
              }
      }
      Filters.prototype.filter = function(listjsobj, origin) {
          let keys = Object.keys(this)
          listjsobj.filter(item => {
            if (keys.every(x => {
                return this[x].f.call(this,x, this[x].itemKey,item)
                })) {
                return true
              } else {
                return false
              }
          })
          this.updateURL()
      }
      Filters.prototype.getValues = function(TYPE, FIELD) {
          let values;
          let start, end;
          switch (TYPE) {
             
              case "multipleSelect":
                  values = this[FIELD].value.join("%2C");
                  break;
             
              case "dateRange":
                  start = this[FIELD].start;
                  end = this[FIELD].end;
                  if ((!start && !end) || (isNaN(start) && isNaN(end))) {
                      values = ""
                  } else if (start === 0 && end === 99999999999) {
                      values = "";
                  } else {
                      values = start + "to" + end;
                  }                    
                  break;
              default:
                  break;
          }
          return values
      }
      Filters.prototype.getURLParamLabel = function(idNumber) {
          // find the right label object using the id number input and the label obj id number to match. number type.
          let label = labels.find(x => x.idNumber === idNumber);
          if (label === undefined) {
              return `filters${idNumber}`
          } else {
              return label.single;
          }
      }
      Filters.prototype.makeURLParameters = function() {
          // let serviceTypes = "serviceTypes=" + this.serviceTypes.join("%2C");
          // ex. ColorfilterOptions1
          let searchTerm = document.querySelector('input#autoComplete').value;
          let queryString = "?"
          let keys = Object.keys(this)
          let firstValid = true;
          keys.forEach((x,i) => {
              let num, label, values;
              // convert to number as this will be used to match an id number from the label objs 
              if (x !== "radius") {
                  num = Number(x.substr(-1))
                  values = this.getValues(this[x].type, x, num)
              } 
              if (values !== null && values !== undefined && String(values).length > 0) {
                  if (x !== "radius") {
                     label = this.getURLParamLabel(num) 
                  }
                  let tmpString = queryString
                  if (values !== null && values !== undefined && values !== "") {
                      queryString = `${tmpString}${!firstValid ? "&" : ""}${label}=${values}`;
                      firstValid = false;
                  }
              }
          })
          if (checkNull(searchTerm) !== "") {
              if (firstValid) {
                  let tmpString = queryString
                  queryString = `${tmpString}searchTerm=${searchTerm}`
              } else {
                  let tmpString = queryString
                  queryString = `${tmpString}&searchTerm=${searchTerm}`
              }
          }
          queryString = queryString === "?" ? "" : queryString;
          return queryString
      }
      Filters.prototype.updateURL = function() {
          let params = this.makeURLParameters();
          history.replaceState({}, null, `/${data.page}/${params}`)
      }
      Filters.prototype.checkIfAllClear = function() {
          let keys = Object.keys(this)
          let count = 0;
          keys.map(key => {
              let type = typeof this[key]
              if (type === "object") {
                  if (
                  this[key].type === "multipleSelect" && this[key].value.length === 0)
                  
                  
                 
                  {
                      count = count + 0;
                  } else {
                      count = count + 1;
                  }
              }
              let keywordVal = document.querySelector('#autoComplete').value;
              if (checkNull(keywordVal) !== "") {
                  count = count + 1;
              }
          })
      }
      Filters.prototype.dateIsTrue = function(categorystore, category, item) {
          let time = item.values()['filterValues1'].sort;
          let start = this.filterOptions1.start;
          let end = this.filterOptions1.end;
          if (start && end) {
              if (time >= start && time <= end) {
                  return true
              } else {
                  return false
              }
          } else if (start) {
              if (time >= start) {
                  return true
              } else {
                  return false
              }
          } else {
              return true
          }
      }
      Filters.prototype.updateDateStart = function(start) {
          start = new Date(`${start}T00:00:00`)
          start = start.setHours(0,0,0,0)
          this.filterOptions1.start = start;
      }
      Filters.prototype.updateDateEnd = function(end) {
          // if (this.fieldOption1) set end
          end = new Date(`${end}T00:00:00`)
          end = end.setHours(23,59,59,999)
          this.filterOptions1.end = end;
      }



      Filters.prototype.categoryIsTrueList = function(thiscategory, category, item) {
          if (this[thiscategory].value.length === 0) {
              return true
          } else if (this[thiscategory].value.some(x => item.values()[category].includes(x))) {
              return true
          } else {
              return false
          }
      }
      Filters.prototype.categoryIsTrue = function(thiscategory, category, item) {
          if (this[thiscategory].value.length === 0) {
              return true
          } else if (this[thiscategory].value === item.values()[category]) {
              return true
          } else {
              return false
          }
      }
      Filters.prototype.categoryCount = function(field) {
        return this[field].value.length;
      }
      Filters.prototype.flushCategory = function(field) {
          let unique = Array.from(new Set(this[field].value));
          this[field].value = unique;
      }
      Filters.prototype.addToCategory = function(field, val) {
        this[field].value.push(val);
        this.flushCategory(field)
      }
      Filters.prototype.removeFromCategory = function(field, val) {
        this[field].value = this[field].value.filter(x => x !== val)
      }
      Filters.prototype.replaceCategory = function(field, val) {
        this[field].value = val;
      }

      
      function getURLParamLabel(idNumber) {
          // find the right label object using the id number input and the label obj id number to match. number type.
          let label = labels.find(x => x.idNumber === idNumber);
          if (label === undefined) {
              return `filters${idNumber}`
          } else {
              return label.single;
          }
      }
      function searchBarAutocomplete( src, keys) {
          const autoCompleteJS = new autoComplete({
              selector: "#autoComplete",
              threshold: 0,
              debounce: 200,
              data: {
                  src: src,
                  keys: keys,
                  cache: true,
              },
              placeHolder: data.config.searchBarPlaceHolder,
              resultsList: {
                  element: (list, data) => {
                      list.setAttribute('role', 'listbox')
                      list.setAttribute("aria-label", "Search result");
                    //  list.setAttribute('id', "autoComplete_list_1")
                      const info = document.createElement("p");
                      if (data.results.length > 0) {
                          info.innerHTML = `Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
                      } else {
                          info.innerHTML = `Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
                      }
                      list.prepend(info);
                  },
                  noResults: true,
                  maxResults: 30,
                  tabSelect: true,
                  idName: "autoComplete_list_1"
              },
              resultItem: {
                  element: (item, data) => {
                      
                      
                      // Modify Results Item Style
                      item.style = "display: flex; justify-content: space-between;";
                      // Modify Results Item Content
                      item.innerHTML = `<span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                      ${data.value.website !== "" ? `<a href="${data.value.website}" target="_blank">${data.match}</a>` : `<div>${data.match}</div>`}</span>`;
                  },
                  highlight: true
              },
              events: {
                  input: {
                      focus: () => {
                          if (autoCompleteJS.input.value.length) autoCompleteJS.start();
                          // autoCompleteJS.input.setAttribute("aria-expanded", "true");
                      },
                      blur: () => {
                          // autoCompleteJS.input.setAttribute("aria-expanded", "false");
                      },
                  }
              }
          });
          autoCompleteJS.input.addEventListener("selection", function (event) {
              const selectedItem = event.detail.selection.value;
              // autoCompleteJS.input.setAttribute("aria-activedescendant", selectedItem.id);
              const feedback = event.detail;
              let key = feedback.selection.key;
              let value = feedback.selection.value[key]
              if (checkNull(value) !== "") {
                  document.querySelector("#autoComplete").innerHTML = value;
                  autoCompleteJS.input.value = value;
                  filters.filter(list)
                  list.search(value.replaceAll(/[^a-zA-Z ]/g, " ").substring(0,60));
              }
          });
          
          return autoCompleteJS
      }
  function updateElementVisibility(element, selector, value) {
      if (value !== "") {
          $(element).find(selector).show();
      } else {
          $(element).find(selector).hide();
      }
  }
  function updateElementAttribute(selector, attribute, value) {
      if (value !== "") {
          $(element).find(selector).attr(attribute, value).show();
      } else {
          $(element).find(selector).hide();
      }
  }

  function openLink(link) {
      window.open(link);
  }

 
      function refreshpagination() {
          document.querySelector('.customPagination').querySelectorAll('li').forEach(x => {
              x.addEventListener('click', function() {
                  scrollUp()
                  
              })
          })
      }
      
      
      
      // CONFIGURATION
      let values = data.config.items.filter(item => item.title !== null && item.title !== undefined && item.title !== "").map((item, index) => generateUsableData(item, index))
    
      if (data.config.defaultSortOrder === "asc") {
          values = values.sort(function(a, b, KEY="defaultSort") {
            if (a[KEY] < b[KEY]) return -1;
            if (a[KEY] > b[KEY]) return 1;
            return 0;
          });
      } else if (data.config.defaultSortOrder === "random") {
          values = values.sort(function(a, b, KEY="randomInt") {
            if (a[KEY] > b[KEY]) return -1;
            if (a[KEY] < b[KEY]) return 1;
            return 0;
          });
      } else if (data.config.defaultSortOrder === "desc") {
          values = values.sort(function(a, b, KEY="defaultSort") {
            if (a[KEY] > b[KEY]) return -1;
            if (a[KEY] < b[KEY]) return 1;
            return 0;
          });
      }

let options = {
        valueNames: [],
        listClass: "itemList",
        item: function(obj) {
            let DISPLAYSLINKS =  checkNull(obj.link1) !== "" || checkNull(obj.link2) !== "" ? `SHOWLINKS` : `HIDELINKS`;
            return `<div class="cardItemContainer" data-id="${obj.id}" ${obj.outerHoverEffect && data.config.hoverStyle === "overlayText" ? `data-content="${obj.overlayText}"` : ""}>
            ${obj.tagsUnderneath !== null & obj.tagsUnderneath !== undefined ? '<div class="NONTAGCONTENT">' : ""}
            <div class="item ${obj.customBgClass} ${data.config.layout} ${data.config.contentOrderLayout} ${data.config.SETBGCOLORBASEDONDYNAMICCLASS ? obj.customBgClass : ""} ${obj.outerHoverEffect && data.config.hoverStyle === "overlayText" ? 'extrahover' : ''}" ${data.config.shadowStyle} ${obj.outerHoverEffect && data.config.hoverStyle === "overlayText" ? `data-content="${obj.overlayText}"` : ""}>
            ${data.config.contentOrderLayout === "titleAboveImage" ? `<div class="title titleAboveImage" style="order:0;">${obj.title}</div>` : ""}
            ${data.config.contentOrderLayout !== "contentOnly" ? obj.imageHTML : ""}
            <div class="cardContent">
                ${data.config.contentOrderLayout !== "titleAboveImage" ? `<div class="title" style="order:${data.config.nameOrder};">${obj.title}</div>` : ""}
                ${obj[`filterValues1HTML`]}
                ${obj[`filterValues2HTML`]}
                ${obj[`filterValues3HTML`]}
                ${obj[`filterValues4HTML`]}
                ${obj[`filterValues5HTML`]}
                ${obj[`filterValues6HTML`]}
                ${obj[`filterValues7HTML`]}
                ${obj[`filterValues8HTML`]}
                ${obj.authorBarHTML}
                ${data.config.wrapMetaDetails ? `<div class='metaDetailsContainer' style='order:${data.config.wrapMetaDetailsORDER}'>` : ""}
                    ${data.config.addresscheck ? obj.addressHTML : ""}

                ${data.config.wrapMetaDetails ? "</div>" : ""}
                ${obj.subtitleHTML}
                ${obj.truncatedDescription}${obj.description}
                ${obj.directionsLink}

               
            </div>
            </div>
            ${obj.tagsUnderneath !== null & obj.tagsUnderneath !== undefined ? `<div class="underneathTags">${obj.tagsUnderneath}</div></div>` : ""}
            </div>`
        },
        page: parseInt(data.config.page),
    pagination: [{
        paginationClass: data.config.paginationStyle,
        left: 1,
        right: 1,
        innerWindow: 2,
        item: `<li><span class="Pagetext">Page </span><a class='page' href='#'>#</a></li>`
    }]
}
      let list = new List("FILTERWIDGET",options, values)
      let domEls = generateDOMelementOptions(values)
      generateDOMElements(domEls)
      let filters = new Filters(domEls)
      filters.pageLoadURLStringParser()
      filters.filter(list)
      labelUpdaterWithResults()
      let searchQuery = document.querySelector('input#autoComplete').value;
      if (searchQuery) {
          list.search(searchQuery)
      }
      
      checkResultCount()
      if (data.config.addSCOverride && data.config.subcategoryOverride !== undefined && data.config.subcategoryOverride !== null) {
          $(element).find(`.filterOptions${child}`).remove()
      }
  const autoCompleteData = values.map(item => {
      let obj = {}
      obj['Name'] = item.title;
      obj['website'] = item.link1 !== undefined && item.link1 !== null && item.v !== "" ? item.link1 : "";
      return obj;
    });
      let nameCheck = autoCompleteData.filter(x => x.Name !== "").length;
      let keys = []
  if (nameCheck > 0) {
      keys.push('Name')     
  }
  let searchController = searchBarAutocomplete(autoCompleteData, keys)
  
  
  document.addEventListener('click', function(event) { 
      // Get the dropdown menu that exists at the time of the click
      let dropdownMenu = document.querySelector('#autoComplete_list_1');
  
      // If there's no dropdown, there's nothing to do
      if (!dropdownMenu) {
          return;
      }
  
      // Check if the click is inside the dropdown
      let isClickInside = dropdownMenu.contains(event.target);
  
      // If the click was outside the dropdown, close it
      if (!isClickInside) {
          searchController.close();
      }
  });

  // Set the aria-label attribute of the results list
  const resultsList = document.querySelector("#autoComplete_list_1");
  if (resultsList) {
      resultsList.setAttribute("aria-label", "Results for search term");
  }
  
  
  // Set the aria-controls attribute of the input field
  const inputField = document.querySelector("#autoComplete");
  // inputField.setAttribute("aria-controls", "autoComplete_list_1");
  
  
  
  function reallylazyLoadImages() {
    // Set up the Intersection Observer
    let observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // When the image comes into the viewport, replace the placeholder with the real image
          let img = entry.target;
          img.src = img.dataset.src;
  
          // Stop observing the image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '0px 0px 50px 0px' // This margin means the callback will be fired when the image is 50px below the viewport
    });
  
    // Start observing all images
    document.querySelectorAll('img.reallylazy').forEach(img => {
      observer.observe(img);
    });
  }
  
  reallylazyLoadImages()
  
  
  // END OF CONFIG CALLS
      function modifyDOMElement(el, newLabel) {
          $(element).find(`.${el}`).find('.subcategoryLabel').text(newLabel);
      }
      function generateNewLabel(count, labelObj, value) {
          if (count === 0) {
              return labelObj.getSingle()
          } else if (count === 1) {
              return value
          } else if (count > 1) {
              return `${labelObj.getPlural()} (${count})`
          }
      }
          function labelUpdaterWithResults() {
              if (data.config.updateLabelsToShowWhatIsSelected) {
              let findLabels = element.querySelectorAll("[id^='filterOptions_']")
              findLabels.forEach(domEl => {
                  let type = domEl.getAttribute('data-type');
                  let num = domEl.getAttribute('data-num')
                  if (parseInt(num) === child) {return}
                  let CATEGORY = `filterOptions${num}`;
                          let count = filters.categoryCount(CATEGORY);
                          let labelObj = labels.find(x => x.optionLabel === CATEGORY)
                          let value = filters[CATEGORY].value;
                          let updatedLabel = generateNewLabel(count, labelObj, value)
                          $(domEl).find('.subcategoryLabel').text(updatedLabel);
                      
                  
              })
          }
      }
      function checkResultCount() {
          let count = list.matchingItems.length;
          if (count === 1) {
              $(element).find('.countBlock').show()
              $(element).find('.COUNT').text(`${count} result`)
              $(element).find('.noResultsFound').hide()
              $(element).find('.paginationContainer').show()
          } else if (count > 1) {
              $(element).find('.countBlock').show()
              $(element).find('.COUNT').text(`${count} results`)
              $(element).find('.noResultsFound').hide()
              $(element).find('.paginationContainer').show()
          } else {
              $(element).find('.countBlock').hide()
              $(element).find('.noResultsFound').show()
              $(element).find('.paginationContainer').hide()
          }
          if (count <= page) {
             $(element).find('.btn-prev').hide()
             $(element).find('.btn-next').hide()
          } else {
              $(element).find('.btn-prev').show()
              $(element).find('.btn-next').show()
          }
      }

      $(element).find("input.filter:checkbox[data-master='checkbox']").change(function() {
            let value = this.value;
            let category = this.getAttribute('data-category');
                if (this.checked) {
                  filters.addToCategory(category, value);
                  filters.checkIfAllClear()
                } else {
                  filters.removeFromCategory(category, value);
                  filters.checkIfAllClear()
                }
              // UPDATE LABELS
              let count = filters.categoryCount(category);
              let labelObj = labels.find(x => x.optionLabel === category)
              if (count === 1) {
                  value = $(element).find(`[data-category=${category}]:checked`).val()
              }
              if (data.config.updateLabelsToShowWhatIsSelected) {
                  let newLabel = generateNewLabel(count, labelObj, value)
                  modifyDOMElement(category, newLabel)
              }
              filters.filter(list)
              checkResultCount() 
      });

      $(element).find('#rangeDate').on('change', function() {
          let dates = this.value;
          let start,end;
          const regex = new RegExp('to');
          if (regex.test(dates)) {
              let dates =  element.querySelector('#rangeDate').value.split(" to ")
              start = dates[0];
              end = dates[1];
              filters.updateDateStart(start)
              filters.updateDateEnd(end)
          } else {
              filters.updateDateStart(dates)
          }
          filters.filter(list)
          checkResultCount()
          filters.checkIfAllClear()
      })   
    
      $(".slideToggle").click(function() {
          if ($(this).hasClass('expanded')) {
              // if it's already visible, close it
              $(this).next('.slideList').hide();
              $(this).removeClass('expanded');
          } else {
              // hide others
              $(element).find('.expanded').removeClass('expanded')
              $(element).find('.slideList').hide();
              //show it
              $(this).next('.slideList').slideToggle();
              $(this).toggleClass('expanded');
          }
      })
      $('select').on('change', function (e) {
          let valueSelected = this.value;
          let key = this.name;
          let id = this.id;
          
        filters.replaceCategory(key, valueSelected)
          
          modifyDOMElement(id, valueSelected)
          filters.filter(list)
          checkResultCount()
          filters.checkIfAllClear()
      });
      $(document).click(function() {
          // if clicking inside of a group container, ignore it and use the slidetoggle on click method
       if (event.target.closest('.groupContainer')) { 
           return 
       } else {
           // hide slidelists if clicking outside of category options
           $('.slideList').hide();
       }
      })
      
      $(element).find("#rangeDate").flatpickr({
              mode: 'range',
              dateFormat: "Y-m-d",
              open: data.config.FILTERLOCATION === "SIDEBARNODROPDOWN",
              inline: data.config.FILTERLOCATION === "SIDEBARNODROPDOWN"
          }); 

  
      function REFRESH_EVENT_LISTENERS() {
          reallylazyLoadImages()
          if (data.config.ONCLICKSTYLE === "popup") {
              setPopupOpenerFunction()
          } else if (data.config.ONCLICKSTYLE === "link") {
              setLinkOpenerFunction(list)
          }

          checkResultCount()
          refreshpagination()
      }
      list.on('updated', REFRESH_EVENT_LISTENERS)
      REFRESH_EVENT_LISTENERS()
      
      function resetSelectElement(selectElement) {
          selectElement.querySelector('option').removeAttribute("disabled")
          let L = selectElement.querySelector('option').value;
          selectElement.value = L;
          selectElement.querySelector('option').setAttribute("disabled", "")
      }
      function labelresetter() {
          if (data.config.updateLabelsToShowWhatIsSelected) {
              let findLabels = element.querySelectorAll("[id^='filterOptions_']")
              findLabels.forEach(domEl => {
                  let type = domEl.getAttribute('data-type');
                  let num = domEl.getAttribute('data-num')
                  if (num !== "9") {
                      let updatedLabel = labels.filter(label => label.idNumber.toString() === num)[0]
                      if (updatedLabel) {
                          updatedLabel = updatedLabel.single
                      } else {
                          updatedLabel = ""
                      }
                      $(domEl).find('.subcategoryLabel').text(updatedLabel);
                  }
              })
              $(element).find('.sortLabel').text("Sort")
          }
      }
      function clearDOMElements() {
          // clear checkboxes
          let checkBoxes = element.querySelectorAll('input[type=checkbox]:checked');
          checkBoxes.forEach(x => {
              x.checked = false;
          });
          let radioBoxes = element.querySelectorAll('input[type=radio]:checked');
          radioBoxes.forEach(x => {
              x.checked = false;
          });
          // clear number inputs
          element.querySelectorAll('input[type="number"]').forEach(x => x.value = "")
          //clear all text inputs
          element.querySelectorAll('input[type="text"]').forEach(x => x.value = "")
          // clear dropdown/select
          element.querySelectorAll('select').forEach(x => {
              resetSelectElement(x)
          })
          labelresetter()
          checkResultCount()
      }
      function clearSearchAutocomplete() {
          document.getElementById('autoComplete').value = "";
          list.search()
          filters.updateURL()
      }
      if (data.config.updateLabelsToShowWhatIsSelected) {
          $(element).find('.sort').on('click', function() {
              let label = $(this).text()
              $(element).find('.sortLabel').text(label)
          })
      }
      $(element).find('.clearSearchAutocomplete').on('click', function() {
          clearSearchAutocomplete()
      })
      $(element).find('.clearFields').click(function() {
          delete filters;
          filters = new Filters(domEls);
          clearDOMElements()
          
          filters.filter(list);
          clearSearchAutocomplete()

          labelresetter()
          filters.checkIfAllClear()
          checkResultCount()
          REFRESH_EVENT_LISTENERS()
      })
      $(element).find('.resultsAndClear').click(function() {
          delete filters;
          filters = new Filters(domEls);
          clearDOMElements()
          filters.filter(list);
          labelresetter()
          filters.checkIfAllClear()
          checkResultCount()
          REFRESH_EVENT_LISTENERS()
      })
      $(element).find(".showFilters").click(function(){
              if ($(this).text() === data.config.showFilters) {
                  $(this).text(data.config.hideFiltersMessage)
                  $(this).removeClass("hideFilters")
                  $(element).find('.filterGroup').slideDown()
                  // TOGGLE THE CLEAR FILTERS BUTTON
  
              } else {
                  $(this).text(data.config.showFilters)
                  $(this).addClass("hideFilters")
                  $(element).find('.filterGroup').slideUp()
              }
          });
      $(element).find('.paginationContainer').append(`<div class="btn-next">${data.config.nextIcon}</div>`);
      $(element).find('.paginationContainer').prepend(`<div class="btn-prev">${data.config.prevIcon}</div>`);
      $(element).find('.btn-next').click(function() {
          let totalPages = list.matchingItems.length;
          let currPage = parseInt($(`.${data.config.paginationStyle} .active a`).text())
      
          let pageToShow = currPage + 1;
          let firstItem = (pageToShow * page) - page + 1;
         
          if (firstItem <= totalPages) {
            list.show(firstItem, page);
          }
          scrollUp()
      })
      $(element).find('.btn-prev').click(function() {
          let currPage = parseInt($(`.${data.config.paginationStyle} .active a`).text())
          let pageToShow = currPage - 1;
          if (pageToShow > 0) {
              let firstItem = (pageToShow * page) - page + 1;
              list.show(firstItem, page);
          }
          scrollUp()
      })
      $('.btn-first').on('click', function(){
          list.show(1, page)
          scrollUp()
      })
      $('.btn-last').on('click', function(){
          let totalPages = list.matchingItems.length;
          list.show(totalPages, page);
          scrollUp()
      })
      $(element).find('.filterGroupMobileToggler').click(function() {
          $(this).find('filterGroup').slideToggle();
      })
      $(element).find('.btn-prev').click(function() {
          $(`.${data.config.paginationStyle} .active`)
          .prev()
          .trigger("click");
      })

      document.querySelector('input#autoComplete').addEventListener('keyup',function() {
          filters.updateURL()
      })
 
  $(element).find('.closeIconContainer').click(function() {
    $(element).find('.modal').toggleClass('hidden')
  })


  $(element).find('#sideBarToggler').click(function() {
      let open = $(this).hasClass('open')
      if (open) {
          // close it
          $(this).removeClass('open')
          $(this).addClass('closed')
          $(element).find('.filterGroup').slideToggle()
          $(element).find('#toggleImg').attr('src', 'https://irp.cdn-website.com/918368d2/dms3rep/multi/noun-chevron-double-right-2439360.svg')
      } else {
          // open it
          $(this).addClass('open')
          $(this).removeClass('closed')
          $(element).find('.filterGroup').slideToggle()
          $(element).find('#toggleImg').attr('src', 'https://irp.cdn-website.com/918368d2/dms3rep/multi/noun-chevron-double-left-2439331.svg')
      }
  })
  

  }) // end of momentjs
  }) // end pluralize
  }) // end flatpickr
  
  }
  executeCode();