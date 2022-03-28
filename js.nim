include karax / prelude
import karax / [vstyles]

proc createDom(): VNode =
  result = buildHtml:
    html:
      head:
        meta(charset = "utf-8")
        title:
          text "Miltons DAO | The Decentralized Reserve Currency"
        meta(content = "Miltons is building a community-owned decentralized financial infrastructure to bring more stability and transparency for the world.", name = "description")
        meta(property = "og:title", content = "Miltons DAO | The Decentralized Reserve Currency")
        meta(property = "og:description", content = "Miltons is building a community-owned decentralized financial infrastructure to bring more stability and transparency for the world.")
        meta(property = "og:image", content = "https://assets.website-files.com/614db7345a4c5347ffac65f2/614df64613b107989bd059d5_Screenshot%202021-09-24%20at%204.57.30%20PM.png")
        meta(property = "twitter:title", content = "Miltons DAO | The Decentralized Reserve Currency")
        meta(property = "twitter:description", content = "Miltons is building a community-owned decentralized financial infrastructure to bring more stability and transparency for the world.")
        meta(property = "twitter:image", content = "https://assets.website-files.com/614db7345a4c5347ffac65f2/614df64613b107989bd059d5_Screenshot%202021-09-24%20at%204.57.30%20PM.png")
        meta(property = "og:type", content = "website")
        meta(content = "summary_large_image", name = "twitter:card")
        meta(content = "width=device-width, initial-scale=1", name = "viewport")
        link(`type` = "text/css", rel = "stylesheet", href = "./style.css")
        script(src = "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js", `type` = "text/javascript")
        script(`type` = "text/javascript"):
          text """
WebFont.load({
  google: {
    families: [
      "Red Hat Display:regular,700",
      "Red Hat Text:regular,600,700",
      "Red Hat Text:regular,500",
    ],
  },
});
"""
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
        link(`type` = "image/x-icon", rel = "shortcut icon", href = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d2e738e29d0d_ohmcon.png")
        link(rel = "apple-touch-icon", href = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d27d25e29d0e_ohm-icon.png")
      body:
        tdiv(data-animation = "over-right", data-duration = "400", role = "banner", class = "navbar w-nav", data-collapse = "medium", data-easing = "ease", data-easing2 = "ease"):
          tdiv(class = "container-1280 flex-align-center margin-top-8 w-container"):
            # a(class = "tablet-expand w-nav-brand", href = "#"):
              # <div class="image-4"></div>
            nav(role = "navigation", class = "expand flex-justify-center w-nav-menu"):
              a(target = "_blank", class = "margin-0 text-color-4 weight-medium w-nav-link", href = "https://app.olympusdao.finance/#/stake"):
                text "Documentation"
              a(target = "_blank", class = "margin-0 text-color-4 weight-medium w-nav-link", href = "https://forum.olympusdao.finance/"):
                text "Governance"
              a(target = "_blank", class = "margin-0 text-color-4 weight-medium w-nav-link", href = "https://snapshot.org/#/olympusdao.eth"):
                text "Vote"
            tdiv(class = "menu-button-2 w-nav-button"):
              tdiv(class = "icon w-icon-nav-menu"):
                text "Connect Wallet"
            a(target = "_blank", class = "button w-button", href = ""):
              text "Enter App"
        tdiv(class = "section-in-large hero overflow-hidden wf-section"):
          tdiv(class = "container-1280 margin-top-32 z-front margin-bottom-16 w-container"):
            tdiv(class = "flex-row margin-bottom-10"):
              a(style = "opacity: 0".toCss, target = "_blank", class = "call-out w-inline-block", href = "https://app.olympusdao.finance/#/zap", data-w-id = "7ebd19f9-a0a2-7440-cd18-ff8c3a03a229"):
                tdiv(class = "button button-small call-out-bar margin-right-2"):
                  text "NEW"
                tdiv(class = "div-block-22"):
                  h6(class = "margin-0 margin-right-2"):
                    text "OlyZaps"
                  p(class = "text-color-3 margin-0 margin-right-2"):
                    text "Zap into Staked OHM with any asset"
                img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/617c249bc6a9dda176ff5f59_arrow-circle-right.svg", loading = "lazy", class = "icon-news", alt = "")
            h1(class = "text-color-4 text-4xl max-width-2xl portrait-max-width-xl"):
              text "The Decentralized Reserve Currency"
            p(class = "text-color-4 text-large max-width-2xl portrait-max-width-xl"):
              text """
Miltons is building a community-owned decentralized financial infrastructure to
bring more stability and transparency for the world."""
          tdiv(class = "div-block")
          tdiv(class = "div-block-24")
          #[          <img
                 src="https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3.png"
                 loading="lazy"
                 data-w-id="c6af5f29-6e73-5edf-a7cd-6a33fc0219be"
                 sizes="(max-width: 1459px) 100vw, 1459px"
                 srcset="
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-500.png   500w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-800.png   800w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-1080.png 1080w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3.png        1459w
                 "
                 alt=""
                 class="absolute cloud-2"
               /><img
                 src="https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3.png"
                 loading="lazy"
                 sizes="(max-width: 1459px) 100vw, 1459px"
                 srcset="
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-500.png   500w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-800.png   800w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-1080.png 1080w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3.png        1459w
                 "
                 alt=""
                 class="absolute cloud-1"
               /><img
                 src="https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3.png"
                 loading="lazy"
                 height="0"
                 sizes="100vw"
                 srcset="
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-500.png   500w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-800.png   800w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3-p-1080.png 1080w,
                   https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d21e62e29cf9_iu-3.png        1459w
                 "
                 alt=""
                 class="absolute cloud-1"
               />
          ]#
          tdiv(class = "gradient-fade")
          img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/61579936bfd51f8bad7fae0a_olympus-background-ng.png", sizes = "(max-width: 479px) 80vw, (max-width: 767px) 100vw, 500px", srcset = " https://assets.website-files.com/614df6c45e16d20d94e29ce9/61579936bfd51f8bad7fae0a_olympus-background-ng-p-500.png 500w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/61579936bfd51f8bad7fae0a_olympus-background-ng-p-800.png 800w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/61579936bfd51f8bad7fae0a_olympus-background-ng-p-1080.png 1080w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/61579936bfd51f8bad7fae0a_olympus-background-ng.png 1540w", loading = "lazy", class = "treasury", alt = "", data-w-id = "e82cd220-3103-abda-f62d-073dde7cea19")
        tdiv(class = "background-color-black text-color-4 padding-y-8 wf-section"):
          tdiv(class = "container-1280 flex-row portrait-flex-wrap portraait-vert w-container"):
            tdiv(class = "flex-column-middle expand display-none"):
              p(class = "margin-0"):
                text "Total OHM Staked"
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
        tdiv(class = "section-in-large background-color-3 relative overflow-hidden adva wf-section"):
          tdiv(class = "container-1280 z-front w-container"):
            tdiv(class = "w-row"):
              tdiv(class = "colno w-col w-col-6"):
                h2:
                  text "Introducing Miltons Pro"
                p(class = "text-large max-width-xl portrait-max-width-small"):
                  text """
We’re bringing Protocol Owned Liquidity to a DAO near you. Learn about Miltons
Pro, our Bonds-as-a-Service protocol."""
                a(target = "_blank", class = "button button-large w-button", href = "/pro"):
                  text "View Miltons Pro"
              tdiv(class = "w-col w-col-6"):
                img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24068e29cfb_image%202.png", sizes = "100vw", srcset = " https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24068e29cfb_image%25202-p-500.png 500w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24068e29cfb_image%202.png 1066w", loading = "lazy", class = "olympus-pro", alt = "")
                tdiv(class = "div-img")
        tdiv(class = "section-in-large background-color-5 wf-section"):
          tdiv(class = "container-1280 z-front w-container"):
            tdiv(class = "w-row"):
              tdiv(class = "column-15 w-col w-col-6"):
                tdiv(class = "button-new button-small call-out-bar"):
                  text "NEW"
                h2:
                  text "OlyZaps"
                p(class = "text-large max-width-xl portrait-max-width-small"):
                  text """
Swap any asset into staked variations of OHM with OlyZaps to reduce complexity
that saves you time while making gas fees more transparent and efficient."""
                  br()
                tdiv(class = "flex-align-center-oly"):
                  a(target = "_blank", class = "button button-large margin-right-4 w-button", href = "https://app.olympusdao.finance/#/zap"):
                    text "Zap-Stake"
                  a(target = "_blank", class = "button button-large background-color-white cursor-not-allowed w-button", href = "/pro"):
                    text "Zap-Bond "
                    span(class = "text-color-3 margin-left-2"):
                      text "Coming Soon"
              tdiv(class = "w-col w-col-6"):
                tdiv(class = "div-img _2")
          img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24068e29cfb_image%202.png", sizes = "100vw", srcset = " https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24068e29cfb_image%25202-p-500.png 500w, https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24068e29cfb_image%202.png 1066w", loading = "lazy", class = "olympus-pro", alt = "")
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
control OHM supply"""
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
Treasury inflow is used to increase Treasury Balance and back outstanding OHM
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
                  text "OHM Token"
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
                  text "OHM Staking APY"
                a(target = "_blank", class = "button button-large w-button", href = "https://app.olympusdao.finance/#/stake"):
                  text "Stake now"
              tdiv(class = "divider")
              tdiv(class = "portrait-text-align-center aadva"):
                h4(class = "text-color-4"):
                  text "Treasury Regulated APY"
                p(class = "max-width-xs weight-bold adva"):
                  text "Treasury inflow will always outperform staking rewards"
                p(class = "max-width-xs"):
                  text """
Miltons is designed with long-term protocol health in mind. All OHM minted for
staking rewards are backed with a reserve from the Treasury."""
            tdiv(class = "flex-column-middle jadva"):
              p(class = "text-xl max-width-large text-align-center"):
                text """
Miltons rewards stakers with compounding interest, increasing their OHM holdings
over time."""
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
Stablecoins are vulnerable to inflationary policies, while Bitcoin or
Ethereum suffer from market crashes or manipulation.  None of these
is a true Store of Value."""
        tdiv(class = "section-in-large display-none wf-section"):
          tdiv(class = "container-1280 w-container"):
            h2(class = "text-align-center text-4xl"):
              text "How is Miltons different?"
            h2(class = "margin-top-32 max-width-medium"):
              text "OHM is designed to grow in value"
            p(class = "text-medium max-width-medium"):
              text """
OHM is backed by an ever-growing, income-generating treasury. We’ve created a
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
                img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d2cfb1e29d05_olympus%20logo%20blk.png", loading = "lazy", class = "image-3", alt = "")
                tdiv(class = "w-layout-grid flex-row flex-wrap afav"):
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://twitter.com/OlympusDAO"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d2e0a8e29d0b_twitter.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://discord.com/invite/olympusdao"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d2b8cbe29d06_discord.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://olympusdao.medium.com"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d281afe29d08_medium.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://t.me/OlympusTG"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d205f1e29d0c_telegram.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://youtube.com/c/olympusdao"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d25f9ce29d0a_youtube.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://www.reddit.com/r/olympusdao/"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d24757e29d09_reddit.svg", loading = "lazy", alt = "")
                  a(target = "_blank", class = "icon-link w-inline-block", href = "https://github.com/OlympusDAO"):
                    img(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/614df6c45e16d262d9e29d07_github.svg", loading = "lazy", alt = "")
                  a(class = "icon-link w-inline-block", href = "#")
                  a(class = "icon-link w-inline-block", href = "#")
                  a(class = "icon-link w-inline-block", href = "#")
              tdiv(id = "w-node-bb49fe36-6366-b243-c6a1-eb2420cc38c4-a7628990"):
                h5:
                  text "Products"
                a(target = "_blank", class = "link-2", href = "https://app.olympusdao.finance/#/bonds"):
                  text "Bonds"
                a(target = "_blank", class = "link-2", href = "https://app.olympusdao.finance/#/stake"):
                  text "Staking"
                a(target = "_blank", class = "link-2", href = "/pro"):
                  text "Miltons Pro"
              tdiv(id = "w-node-_809660db-c1ab-cfcb-6fbe-f089101251d1-a7628990"):
                h5:
                  text "Learn"
                a(target = "_blank", class = "link-2", href = "https://docs.olympusdao.finance/main/"):
                  text "Documentation"
                a(target = "_blank", class = "link-2", href = "https://olympusdao.medium.com"):
                  text "Medium"
              tdiv:
                h5:
                  text "Join the community"
                a(target = "_blank", class = "link-2", href = "https://discord.com/invite/6QjjtUcfM4"):
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
        // var totalOhmStaked = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(result.data.protocolMetrics[0].sOhmCirculatingSupply);
        // var totalOhm = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(result.data.protocolMetrics[0].ohmCirculatingSupply);
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
        script(src = "https://assets.website-files.com/614df6c45e16d20d94e29ce9/js/olympus-1881bb-a21023eff9b0aeb1f1361df7.fdb462228.js", `type` = "text/javascript")

        noscript:
          iframe(src = "https://www.googletagmanager.com/ns.html?id=GTM-NJSWZX5", style = "display: none; visibility: hidden".toCss, width = "0", height = "0")

setRenderer createDom
