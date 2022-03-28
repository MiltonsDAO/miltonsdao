include karax / prelude
import karax / [vstyles]

proc createDom(): VNode =
  result = buildHtml:
    html:
      head:
        meta(charset = "utf-8")
        title:
          text "Miltons DAO | The Decentralized Reserve Currency"
        meta(property = "og:type", content = "website")
        meta(content = "width=device-width, initial-scale=1", name = "viewport")
        link(`type` = "text/css", rel = "stylesheet", href = "./style.css")
        script(src = "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js", `type` = "text/javascript")
        script(`type` = "text/javascript"):
          text """
!(function (o, c) {
  var n = c.documentElement,
    t = " w-mod-";
  (n.className += t + "js"),
    ("ontouchstart" in o ||
      (o.DocumentTouch && c instanceof DocumentTouch)) &&
      (n.className += t + "touch");
})(window, document);
"""
      body:
        tdiv(data-animation = "over-right", data-duration = "400", role = "banner", class = "navbar w-nav", data-collapse = "medium", data-easing = "ease", data-easing2 = "ease"):
          tdiv(class = "container-1280 flex-align-center margin-top-8 w-container"):
            a(class = "tablet-expand w-nav-brand", href = "#"):
              tdiv(class = "image-4")
            nav(role = "navigation", class = "expand flex-justify-center w-nav-menu"):
              a(target = "_blank", class = "margin-0 text-color-4 weight-medium w-nav-link", href = "https://app.miltonsdao.finance/#/stake"):
                text "Documentation"
              a(target = "_blank", class = "margin-0 text-color-4 weight-medium w-nav-link", href = "./Miltons DAO Whitepaper.pdf"):
                text "Whitepaper"
              a(target = "_blank", class = "margin-0 text-color-4 weight-medium w-nav-link", href = "https://forum.miltonsdao.finance/"):
                text "Governance"
              a(target = "_blank", class = "margin-0 text-color-4 weight-medium w-nav-link", href = "https://snapshot.org/#/miltonsdao.eth"):
                text "Vote"
            tdiv(class = "menu-button-2 w-nav-button"):
              tdiv(class = "icon w-icon-nav-menu")
            a(target = "_blank", class = "button w-button", href = ""):
              text "Enter App"
        tdiv(class = "section-in-large hero overflow-hidden wf-section"):
          tdiv(class = "container-1280 margin-top-32 z-front margin-bottom-16 w-container"):
            h1(class = "text-color-4 text-4xl max-width-2xl portrait-max-width-xl"):
              text "The Decentralized Reserve Currency"
            p(class = "text-color-4 text-large max-width-2xl portrait-max-width-xl"):
              text """
MiltonsDAO is building a community-owned decentralized financial infrastructure
to bring more stability and transparency for the world."""
          tdiv(class = "container-1280 margin-top-32 z-front margin-bottom-16 w-container milton"):
            p:
              text "When appealing for the dispossessed, it's a right, not a charity——Thomas Paine"
          tdiv(class = "background-color-black text-color-4 padding-y-8 wf-section"):
            tdiv(class = "container-1280 flex-row portrait-flex-wrap portraait-vert w-container"):
              tdiv(class = "flex-column-middle expand display-none"):
                p(class = "margin-0"):
                  text "Total your Staked"
                p(class = "ban text-2xl weight-bold", id = "percentageOhmStaked"):
                  text "98.3%"
              tdiv(class = "flex-column-middle expand"):
                p(class = "margin-0"):
                  text "Treasury Balance"
                p(class = "ban text-2xl weight-bold", id = "treasuryBalance"):
                  text "$154,953,554"
              tdiv(class = "flex-column-middle expand"):
                p(class = "margin-0"):
                  text "Total Value Locked"
                p(class = "ban text-2xl weight-bold", id = "totalValueLocked"):
                  text "$14,553,554"
              tdiv(class = "flex-column-middle expand"):
                p(class = "margin-0"):
                  text "Current APY"
                p(class = "ban text-2xl weight-bold", id = "currentAPY"):
                  text "7,564%"
        tdiv(class = "section-in-large display-none wf-section"):
          tdiv(class = "container-1280 w-container"):
            h2(class = "text-align-center text-4xl"):
              text "How Miltons works"
            tdiv(class = "flex-row-middle flex-justify-center margin-y-16 relative portriat-vertical"):
              tdiv(class = "div-block-23"):
                tdiv(class = "flex-align-baseline"):
                  p(class = "number"):
                    text "1"
                  h5:
                    text "Treasury Revenue"
                h3:
                  text "Bonds"
                p(class = "max-width-xs"):
                  text """
Our bonding mechanism increase Treasury Revenue and lock in liquidity to help
control your supply"""
              tdiv(class = "margin-left-32")
              img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27593e29cfe_Vector%2021.png", sizes = "100vw", srcset = " https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27593e29cfe_Vector%252021-p-500.png 500w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27593e29cfe_Vector%252021-p-800.png 800w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27593e29cfe_Vector%2021.png 942w", loading = "lazy", class = "image", alt = "")
            tdiv(class = "flex-row-middle flex-justify-center margin-y-32 relative adv portrait-vertical reverse"):
              tdiv(class = "margin-left-32 _2")
              tdiv(class = "div-block-23"):
                tdiv(class = "flex-align-baseline"):
                  p(class = "number"):
                    text "2"
                  h5:
                    text "Treasury Growth"
                h3:
                  text "Miltons Treasury"
                p(class = "max-width-xs"):
                  text """
Treasury inflow is used to increase Treasury Balance and back outstanding your
tokens and regulate staking APY"""
              img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d23f84e29cfd_Vector%2022.png", sizes = "100vw", srcset = " https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d23f84e29cfd_Vector%252022-p-500.png 500w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d23f84e29cfd_Vector%252022-p-800.png 800w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d23f84e29cfd_Vector%2022.png 801w", loading = "lazy", class = "image adkvna", alt = "")
            tdiv(class = "flex-row-middle flex-justify-center margin-y-16 portrait-vertical"):
              tdiv(class = "div-block-23"):
                tdiv(class = "flex-align-baseline"):
                  p(class = "number"):
                    text "3"
                  h5:
                    text "Staking Rewards"
                h3:
                  text "your Token"
                p(class = "max-width-xs"):
                  text """
Compounds yields automatically through a treasury backed currency with intrinsic
value"""
              tdiv(class = "margin-left-32 _3")
        tdiv(class = "section-in-large background-color-2 text-color-4 display-none wf-section"):
          tdiv(class = "container-1280 w-container"):
            h2(class = "text-align-center text-color-4 text-4xl"):
              text "Sustainable Staking APY"
            tdiv(class = "flex-row-middle flex-justify-center margin-y-16 relative portriat-vertical"):
              tdiv(class = "text-align-right adva"):
                h3(class = "text-color-2 text-4xl", id = "currentAPY2"):
                  text "7,453%"
                p(class = "max-width-xs"):
                  text "your Staking APY"
                a(target = "_blank", class = "button button-large w-button", href = "https://app.miltonsdao.finance/#/stake"):
                  text "Stake now"
              tdiv(class = "divider")
              tdiv(class = "portrait-text-align-center aadva"):
                h4(class = "text-color-4"):
                  text "Treasury Regulated APY"
                p(class = "max-width-xs weight-bold adva"):
                  text "Treasury inflow will always outperform staking rewards"
                p(class = "max-width-xs"):
                  text """
Miltons is designed with long-term protocol health in mind. All your minted for
staking rewards are backed with a reserve from the Treasury."""
            tdiv(class = "flex-column-middle jadva"):
              p(class = "text-xl max-width-large text-align-center"):
                text """
Miltons rewards stakers with compounding interest, increasing their your
holdings over time."""
        tdiv(class = "section-in-large background-color-1 display-none wf-section"):
          tdiv(class = "container-1280 w-container"):
            tdiv(class = "flex-row-middle flex-justify-center portrait-vertical"):
              tdiv:
                h2(class = "text-4xl max-width-2xl margin-right-32 width-full"):
                  text "A true Store of Value doesn’t exist—yet"
              tdiv:
                p(class = "text-medium max-width-medium"):
                  text "A Store of Value is an asset that is stable or increases in value over time. "
                  br()
                  br()
                  text """
Stablecoins are vulnerable to inflationary policies, while Bitcoin
or Ethereum suffer from market crashes or manipulation.  None of
these is a true Store of Value."""
        tdiv(class = "section-in-large display-none wf-section"):
          tdiv(class = "container-1280 w-container"):
            h2(class = "text-align-center text-4xl"):
              text "How is Miltons different?"
            h2(class = "margin-top-32 max-width-medium"):
              text "your is designed to grow in value"
            p(class = "text-medium max-width-medium"):
              text """
your is backed by an ever-growing, income-generating treasury. We’ve created a
currency that is able to constantly grow purchasing power despite market
conditions."""
          img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27d25e29d03_Group%2077.png", sizes = "100vw", srcset = " https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27d25e29d03_Group%252077-p-500.png 500w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27d25e29d03_Group%252077-p-1080.png 1080w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27d25e29d03_Group%252077-p-1600.png 1600w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27d25e29d03_Group%252077-p-2000.png 2000w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27d25e29d03_Group%2077.png 2880w", loading = "lazy", class = "image-2", alt = "")
        tdiv(class = "section-in-large background-color-1 display-none wf-section"):
          tdiv(class = "container-1280 w-container"):
            tdiv(class = "flex-row-middle flex-justify-center portrait-vertical"):
              tdiv(class = "margin-right-32 tablet-width-full"):
                h4:
                  text "Liquidity Protected"
                p(class = "weight-bold text-color-3"):
                  text "Miltons LP is owned and protected by Miltons itself"
                p(class = "text-medium max-width-medium dvaav"):
                  text """
Miltons owns almost all of its liquidity, which helps maintain price stability
and treasury income. With a protocol-owned liquidity, Miltons is protected from
unpredictable and unfavorable market conditions due to longevity and efficiency."""
              tdiv:
                tdiv(class = "flex-align-center portrait-vertical"):
                  tdiv:
                    h3(class = "text-3xl margin-0", id = "protocol-owned-liquidity"):
                      text "$155,500,000"
                    p:
                      text "Protocol Owned Liquidity"
                tdiv(class = "flex-align-center margin-top-8 portrait-vertical"):
                  tdiv:
                    h3(class = "text-3xl margin-0"):
                      text "99.5%"
                    p:
                      text "of Total LP supply"
        tdiv(class = "section-in-large display-none wf-section"):
          tdiv(class = "container-1280 w-container"):
            h2(class = "text-align-center text-4xl"):
              text "Trusted by"
            img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d26e11e29d04_Group%20501.png", sizes = "100vw", srcset = " https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d26e11e29d04_Group%2520501-p-500.png 500w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d26e11e29d04_Group%2520501-p-800.png 800w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d26e11e29d04_Group%2520501-p-1080.png 1080w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d26e11e29d04_Group%2520501-p-1600.png 1600w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d26e11e29d04_Group%20501.png 1935w", loading = "lazy", class = "margin-top-8", alt = "")
        tdiv(class = "section-in-large background-color-1 wf-section"):
          tdiv(class = "container-1280 w-container"):
            tdiv(class = "grid-4-columns"):
              tdiv(id = "w-node-c0ee0fcc-54dc-c412-c61b-e85cc34204eb-a7628990"):
                tdiv(class = "w-layout-grid flex-row flex-wrap afav"):
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://twitter.com/"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d2e0a8e29d0b_twitter.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://discord.com/invite/miltonsdao"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d2b8cbe29d06_discord.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://miltonsdao.medium.com"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d281afe29d08_medium.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://t.me/"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d205f1e29d0c_telegram.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://youtube.com/c/miltonsdao"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d25f9ce29d0a_youtube.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://www.reddit.com/r/miltonsdao/"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24757e29d09_reddit.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://github.com/"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d262d9e29d07_github.svg", loading = "lazy", alt = "")
                  a(class = "icon-link w-inline-block", href = "#")
                  a(class = "icon-link w-inline-block", href = "#")
                  a(class = "icon-link w-inline-block", href = "#")
              tdiv(id = "w-node-bb49fe36-6366-b243-c6a1-eb2420cc38c4-a7628990"):
                h5:
                  text "Products"
                a(target = "_blank", class = "link-2", href = "https://app.miltonsdao.finance/#/bonds"):
                  text "Bonds"
                a(target = "_blank", class = "link-2", href = "https://app.miltonsdao.finance/#/stake"):
                  text "Staking"
              tdiv(id = "w-node-_809660db-c1ab-cfcb-6fbe-f089101251d1-a7628990"):
                h5:
                  text "Learn"
                a(target = "_blank", class = "link-2", href = "https://docs.miltonsdao.finance/main/"):
                  text "Documentation"
                a(target = "_blank", class = "link-2", href = "https://miltonsdao.medium.com"):
                  text "Medium"
              tdiv:
                h5:
                  text "Join the community"
                a(target = "_blank", class = "link-2", href = "https://discord.com/"):
                  text "Join Discord"
                a(class = "subscribe-link", href = "#"):
                  text "Subscribe"
        tdiv(class = "w-embed w-script"):
          script:
            text """
document.addEventListener("DOMContentLoaded", function (event) {
  function getTheGraphData() {
    var URL =
      "https://api.thegraph.com/subgraphs/name/drondin/olympus-protocol-metrics";
    $.ajax({
      url: URL,
      type: "POST",
      contentType: "application/json",
      data: '{"query": "{ protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) { ohmCirculatingSupply sOhmCirculatingSupply treasuryMarketValue runwayCurrent currentAPY totalValueLocked }}"}',
      async: false,
      success: function (result) {
        var currentAPY = new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        }).format(result.data.protocolMetrics[0].currentAPY);
        var treasuryBalance = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        }).format(result.data.protocolMetrics[0].treasuryMarketValue);
        var totalValueLocked = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        }).format(result.data.protocolMetrics[0].totalValueLocked);

        var totalOhmStaked =
          result.data.protocolMetrics[0].sOhmCirculatingSupply;
        var totalOhm =
          result.data.protocolMetrics[0].ohmCirculatingSupply;
        var totalOhmStakedPercentage = new Intl.NumberFormat("en-US", {
          style: "percent",
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        }).format(totalOhmStaked / totalOhm);

        $("#currentAPY").html(currentAPY + "%");
        $("#currentAPY2").html(currentAPY + "%");
        $("#percentageOhmStaked").html(totalOhmStakedPercentage);
        $("#treasuryBalance").html(treasuryBalance);
        $("#totalValueLocked").html(totalValueLocked);
      },
      error: function (error) {
        console.log("Error fetching graph data");
      },
    });
  }

  getTheGraphData();
});
"""
        script(src = "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=614df6c45e16d20d94e29ce9", `type` = "text/javascript", integrity = "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=", crossorigin = "anonymous")
        script(src = "./miltonsDAO.js", `type` = "text/javascript")

setRenderer createDom
