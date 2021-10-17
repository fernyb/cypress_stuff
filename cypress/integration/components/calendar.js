describe('Calendar', () => {
  beforeEach(() => {
  })

  it("set date", () => {
    cy.visit("https://anvil.servicetitan.com/components/date-picker/")

    const setDate = () => {
      cy.wait(2000);

      const field = () => cy.get(".Card.CodeDemo").eq(1);
      const input = () => field().find("input");

      input().click().then(() => {
        cy.wait(3000);
      });

      const calendar = () => cy.get(".DatePicker__calendar");
      calendar().then(($el) => {
        console.log($el);
      });

      // const listener = () => cy.get(".k-calendar-view.k-calendar-monthview .k-content.k-scrollable .k-calendar-table");
      // listener().then(($el) => {
      //   $el[0].addEventListener("scroll", (el) => console.log(el));
      // });

      let newTopOffset = 0;
      const scrollToMonthYear = () => {
        const content = () => cy.get(".k-calendar-view.k-calendar-monthview .k-content.k-scrollable .k-calendar-table");
        content().then(($table) => {
          return cy.wrap($table).parent().parent().find("thead.k-calendar-thead").then(($thead) => {
            // return cy.wrap($thead).height();
            return $thead.height();
          }).then((trHeight) => {
            return cy.wrap($table).find(".k-calendar-tbody").first().then(($tbody) => {
              return $tbody.height();
            }).then((tbodyHeight) => {
              return [trHeight, tbodyHeight];
            });
            // return [trHeight, cy.wrap($table).find(".k-calendar-tbody").first()];
          });
        })
        .then(([trHeight, tbodyHeight]) => {
          newTopOffset += 10;
          // count += 1;
          content().scrollIntoView({ offset: { top: newTopOffset, left: 0 }}).then(($content) => {
          //   console.log(`offset top: ${$content.offset().top}, newTop: ${newTopOffset}`);
          //   console.log(count);
          //     resolve("done");
          });
        }).then((resp) => {
          console.log(resp);
          console.log("done.");
        });
      };

      // cy.pause();

      let found = false;

      const searchForMonthYear = () => {
        const content = () => cy.get(".k-widget.k-calendar.k-calendar-infinite");
        // .realHover({ scrollBehavior: false, x: 10, y: 10 })
        content()
        .realMouseWheel({ scrollBehavior: false, position: "center", deltaY: -500 })
        cy.wait(100);

        content().find(".k-calendar-tr [title]").then(($titles) => {
          for(let i=0; i<$titles.length; i++) {
            let match = $titles[i].getAttribute("title").match(/June 18, 2019/)
            if (match && found === false) {
              found = true;
              console.log("FOUND! ", $titles[i]);
              cy.wrap($titles[i]).click();
              break;
            }
            if (found === true) {
              break;
            }
          }
          if (found === false) {
            searchForMonthYear();
          }
        });
      };

      searchForMonthYear();


      // cy.window()
      // .trigger("mousemove", {
      //   clientX: 504,
      //   clientY: 1138,
      //   x: 504,
      //   y: 1138,
      //   offsetX: 504,
      //   offsetY: 1138,
      //   scrollBehavior: false
      // });

      // contentTable().realHover({ x: 150, y: 100 })
      // contentTable().realMouseWheel({ deltaY: -10 })
      // contentTable().realMouseWheel({ deltaY: -10 })
      // contentTable().realMouseWheel({ deltaY: -10 })

      // const ths = () => contentTable().find("th");
      // ths().contains("February 2022").scrollIntoView();
      // ths().then(($th) => {
      //   console.log("TH: ", $th);
      // });
      // ths().contains("March 2022").scrollIntoView();
    };

    setDate();
  });
});