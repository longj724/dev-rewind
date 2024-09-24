// vite.config.ts
import react from "file:///Users/justinlong/Documents/projects/chrome-extensions/dev-rewind/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import fs from "fs";
import { defineConfig } from "file:///Users/justinlong/Documents/projects/chrome-extensions/dev-rewind/node_modules/vite/dist/node/index.js";
import { crx } from "file:///Users/justinlong/Documents/projects/chrome-extensions/dev-rewind/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  version: "1",
  name: "DevRewind",
  description: "Rewind you developer console",
  options_ui: {
    page: "src/pages/options/index.html"
  },
  background: {
    service_worker: "src/pages/background/index.ts",
    type: "module"
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: {
      "32": "public/icon-32.png"
    }
  },
  icons: {
    "128": "public/icon-128.png"
  },
  permissions: [
    "tabCapture",
    "offscreen",
    "scripting",
    "storage",
    "desktopCapture",
    "tabs"
  ],
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.tsx"]
    }
  ],
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: ["camera.html", "camera.js", "video.html", "video.js"],
      matches: ["https://*/*", "http://*/*"]
    }
  ]
};

// manifest.dev.json
var manifest_dev_default = {
  action: {
    default_icon: "public/dev-icon-32.png",
    default_popup: "src/pages/popup/index.html"
  },
  icons: {
    "128": "public/dev-icon-128.png"
  },
  web_accessible_resources: [
    {
      resources: [
        "contentStyle.css",
        "dev-icon-128.png",
        "dev-icon-32.png"
      ],
      matches: []
    }
  ]
};

// package.json
var package_default = {
  name: "vite-web-extension",
  version: "1.2.0",
  description: "A simple chrome extension template with Vite, React, TypeScript and Tailwind CSS.",
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/JohnBra/web-extension.git"
  },
  scripts: {
    build: "vite build",
    dev: "nodemon"
  },
  type: "module",
  dependencies: {
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    clsx: "^2.1.1",
    "lucide-react": "^0.445.0",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "webextension-polyfill": "^0.11.0"
  },
  devDependencies: {
    "@crxjs/vite-plugin": "^2.0.0-beta.23",
    "@types/chrome": "^0.0.268",
    "@types/node": "^20.16.5",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@types/webextension-polyfill": "^0.10.7",
    "@typescript-eslint/eslint-plugin": "^7.8.0",
    "@typescript-eslint/parser": "^7.8.0",
    "@vitejs/plugin-react": "^4.2.1",
    autoprefixer: "^10.4.19",
    eslint: "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "fs-extra": "^11.2.0",
    nodemon: "^3.1.0",
    postcss: "^8.4.38",
    tailwindcss: "^3.4.3",
    "ts-node": "^10.9.2",
    typescript: "^5.4.5",
    vite: "^5.2.11"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "/Users/justinlong/Documents/projects/chrome-extensions/dev-rewind";
var root = resolve(__vite_injected_original_dirname, "src");
var pagesDir = resolve(root, "pages");
var assetsDir = resolve(root, "assets");
var outDir = resolve(__vite_injected_original_dirname, "dist");
var publicDir = resolve(__vite_injected_original_dirname, "public");
var isDev = process.env.__DEV__ === "true";
var extensionManifest = {
  ...manifest_default,
  ...isDev ? manifest_dev_default : {},
  name: isDev ? `DEV: ${manifest_default.name}` : manifest_default.name,
  version: package_default.version
};
function stripDevIcons(apply) {
  if (apply)
    return null;
  return {
    name: "strip-dev-icons",
    resolveId(source) {
      return source === "virtual-module" ? source : null;
    },
    renderStart(outputOptions, inputOptions) {
      const outDir2 = outputOptions.dir;
      fs.rm(resolve(outDir2, "dev-icon-32.png"), () => console.log(`Deleted dev-icon-32.png frm prod build`));
      fs.rm(resolve(outDir2, "dev-icon-128.png"), () => console.log(`Deleted dev-icon-128.png frm prod build`));
    }
  };
}
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir
    }
  },
  plugins: [
    react(),
    crx({
      manifest: extensionManifest,
      contentScripts: {
        injectCss: true
      }
    }),
    stripDevIcons(isDev)
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: isDev,
    emptyOutDir: !isDev
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiIsICJtYW5pZmVzdC5kZXYuanNvbiIsICJwYWNrYWdlLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvanVzdGlubG9uZy9Eb2N1bWVudHMvcHJvamVjdHMvY2hyb21lLWV4dGVuc2lvbnMvZGV2LXJld2luZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2p1c3RpbmxvbmcvRG9jdW1lbnRzL3Byb2plY3RzL2Nocm9tZS1leHRlbnNpb25zL2Rldi1yZXdpbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2p1c3RpbmxvbmcvRG9jdW1lbnRzL3Byb2plY3RzL2Nocm9tZS1leHRlbnNpb25zL2Rldi1yZXdpbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgY3J4LCBNYW5pZmVzdFYzRXhwb3J0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJztcblxuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuanNvbic7XG5pbXBvcnQgZGV2TWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdC5kZXYuanNvbic7XG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJztcblxuY29uc3Qgcm9vdCA9IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyk7XG5jb25zdCBwYWdlc0RpciA9IHJlc29sdmUocm9vdCwgJ3BhZ2VzJyk7XG5jb25zdCBhc3NldHNEaXIgPSByZXNvbHZlKHJvb3QsICdhc3NldHMnKTtcbmNvbnN0IG91dERpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnZGlzdCcpO1xuY29uc3QgcHVibGljRGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnKTtcblxuY29uc3QgaXNEZXYgPSBwcm9jZXNzLmVudi5fX0RFVl9fID09PSAndHJ1ZSc7XG5cbmNvbnN0IGV4dGVuc2lvbk1hbmlmZXN0ID0ge1xuICAuLi5tYW5pZmVzdCxcbiAgLi4uKGlzRGV2ID8gZGV2TWFuaWZlc3QgOiB7fSBhcyBNYW5pZmVzdFYzRXhwb3J0KSxcbiAgbmFtZTogaXNEZXYgPyBgREVWOiAkeyBtYW5pZmVzdC5uYW1lIH1gIDogbWFuaWZlc3QubmFtZSxcbiAgdmVyc2lvbjogcGtnLnZlcnNpb24sXG59O1xuXG4vLyBwbHVnaW4gdG8gcmVtb3ZlIGRldiBpY29ucyBmcm9tIHByb2QgYnVpbGRcbmZ1bmN0aW9uIHN0cmlwRGV2SWNvbnMgKGFwcGx5OiBib29sZWFuKSB7XG4gIGlmIChhcHBseSkgcmV0dXJuIG51bGxcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdzdHJpcC1kZXYtaWNvbnMnLFxuICAgIHJlc29sdmVJZCAoc291cmNlOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzb3VyY2UgPT09ICd2aXJ0dWFsLW1vZHVsZScgPyBzb3VyY2UgOiBudWxsXG4gICAgfSxcbiAgICByZW5kZXJTdGFydCAob3V0cHV0T3B0aW9uczogYW55LCBpbnB1dE9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3Qgb3V0RGlyID0gb3V0cHV0T3B0aW9ucy5kaXJcbiAgICAgIGZzLnJtKHJlc29sdmUob3V0RGlyLCAnZGV2LWljb24tMzIucG5nJyksICgpID0+IGNvbnNvbGUubG9nKGBEZWxldGVkIGRldi1pY29uLTMyLnBuZyBmcm0gcHJvZCBidWlsZGApKVxuICAgICAgZnMucm0ocmVzb2x2ZShvdXREaXIsICdkZXYtaWNvbi0xMjgucG5nJyksICgpID0+IGNvbnNvbGUubG9nKGBEZWxldGVkIGRldi1pY29uLTEyOC5wbmcgZnJtIHByb2QgYnVpbGRgKSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQHNyYyc6IHJvb3QsXG4gICAgICAnQGFzc2V0cyc6IGFzc2V0c0RpcixcbiAgICAgICdAcGFnZXMnOiBwYWdlc0RpcixcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBjcngoe1xuICAgICAgbWFuaWZlc3Q6IGV4dGVuc2lvbk1hbmlmZXN0IGFzIE1hbmlmZXN0VjNFeHBvcnQsXG4gICAgICBjb250ZW50U2NyaXB0czoge1xuICAgICAgICBpbmplY3RDc3M6IHRydWUsXG4gICAgICB9XG4gICAgfSksXG4gICAgc3RyaXBEZXZJY29ucyhpc0RldilcbiAgXSxcbiAgcHVibGljRGlyLFxuICBidWlsZDoge1xuICAgIG91dERpcixcbiAgICBzb3VyY2VtYXA6IGlzRGV2LFxuICAgIGVtcHR5T3V0RGlyOiAhaXNEZXZcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJtYW5pZmVzdF92ZXJzaW9uXCI6IDMsXG4gIFwidmVyc2lvblwiOiBcIjFcIixcbiAgXCJuYW1lXCI6IFwiRGV2UmV3aW5kXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJSZXdpbmQgeW91IGRldmVsb3BlciBjb25zb2xlXCIsXG4gIFwib3B0aW9uc191aVwiOiB7XG4gICAgXCJwYWdlXCI6IFwic3JjL3BhZ2VzL29wdGlvbnMvaW5kZXguaHRtbFwiXG4gIH0sXG4gIFwiYmFja2dyb3VuZFwiOiB7XG4gICAgXCJzZXJ2aWNlX3dvcmtlclwiOiBcInNyYy9wYWdlcy9iYWNrZ3JvdW5kL2luZGV4LnRzXCIsXG4gICAgXCJ0eXBlXCI6IFwibW9kdWxlXCJcbiAgfSxcbiAgXCJhY3Rpb25cIjoge1xuICAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcInNyYy9wYWdlcy9wb3B1cC9pbmRleC5odG1sXCIsXG4gICAgXCJkZWZhdWx0X2ljb25cIjoge1xuICAgICAgXCIzMlwiOiBcInB1YmxpYy9pY29uLTMyLnBuZ1wiXG4gICAgfVxuICB9LFxuICBcImljb25zXCI6IHtcbiAgICBcIjEyOFwiOiBcInB1YmxpYy9pY29uLTEyOC5wbmdcIlxuICB9LFxuICBcInBlcm1pc3Npb25zXCI6IFtcbiAgICBcInRhYkNhcHR1cmVcIixcbiAgICBcIm9mZnNjcmVlblwiLFxuICAgIFwic2NyaXB0aW5nXCIsXG4gICAgXCJzdG9yYWdlXCIsXG4gICAgXCJkZXNrdG9wQ2FwdHVyZVwiLFxuICAgIFwidGFic1wiXG4gIF0sXG4gIFwiY29udGVudF9zY3JpcHRzXCI6IFtcbiAgICB7XG4gICAgICBcIm1hdGNoZXNcIjogW1wiaHR0cDovLyovKlwiLCBcImh0dHBzOi8vKi8qXCIsIFwiPGFsbF91cmxzPlwiXSxcbiAgICAgIFwianNcIjogW1wic3JjL3BhZ2VzL2NvbnRlbnQvaW5kZXgudHN4XCJdXG4gICAgfVxuICBdLFxuICBcImRldnRvb2xzX3BhZ2VcIjogXCJzcmMvcGFnZXMvZGV2dG9vbHMvaW5kZXguaHRtbFwiLFxuICBcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXG4gICAge1xuICAgICAgXCJyZXNvdXJjZXNcIjogW1wiY2FtZXJhLmh0bWxcIiwgXCJjYW1lcmEuanNcIiwgXCJ2aWRlby5odG1sXCIsIFwidmlkZW8uanNcIl0sXG4gICAgICBcIm1hdGNoZXNcIjogW1wiaHR0cHM6Ly8qLypcIiwgXCJodHRwOi8vKi8qXCJdXG4gICAgfVxuICBdXG59XG4iLCAie1xuICBcImFjdGlvblwiOiB7XG4gICAgXCJkZWZhdWx0X2ljb25cIjogXCJwdWJsaWMvZGV2LWljb24tMzIucG5nXCIsXG4gICAgXCJkZWZhdWx0X3BvcHVwXCI6IFwic3JjL3BhZ2VzL3BvcHVwL2luZGV4Lmh0bWxcIlxuICB9LFxuICBcImljb25zXCI6IHtcbiAgICBcIjEyOFwiOiBcInB1YmxpYy9kZXYtaWNvbi0xMjgucG5nXCJcbiAgfSxcbiAgXCJ3ZWJfYWNjZXNzaWJsZV9yZXNvdXJjZXNcIjogW1xuICAgIHtcbiAgICAgIFwicmVzb3VyY2VzXCI6IFtcbiAgICAgICAgXCJjb250ZW50U3R5bGUuY3NzXCIsXG4gICAgICAgIFwiZGV2LWljb24tMTI4LnBuZ1wiLFxuICAgICAgICBcImRldi1pY29uLTMyLnBuZ1wiXG4gICAgICBdLFxuICAgICAgXCJtYXRjaGVzXCI6IFtdXG4gICAgfVxuICBdXG59XG4iLCAie1xuICBcIm5hbWVcIjogXCJ2aXRlLXdlYi1leHRlbnNpb25cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4yLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkEgc2ltcGxlIGNocm9tZSBleHRlbnNpb24gdGVtcGxhdGUgd2l0aCBWaXRlLCBSZWFjdCwgVHlwZVNjcmlwdCBhbmQgVGFpbHdpbmQgQ1NTLlwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9Kb2huQnJhL3dlYi1leHRlbnNpb24uZ2l0XCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZFwiLFxuICAgIFwiZGV2XCI6IFwibm9kZW1vblwiXG4gIH0sXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0XCI6IFwiXjIuMS4xXCIsXG4gICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2xvdFwiOiBcIl4xLjEuMFwiLFxuICAgIFwiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCI6IFwiXjAuNy4wXCIsXG4gICAgXCJjbHN4XCI6IFwiXjIuMS4xXCIsXG4gICAgXCJsdWNpZGUtcmVhY3RcIjogXCJeMC40NDUuMFwiLFxuICAgIFwicmVhY3RcIjogXCJeMTguMy4xXCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTguMy4xXCIsXG4gICAgXCJ0YWlsd2luZC1tZXJnZVwiOiBcIl4yLjUuMlwiLFxuICAgIFwidGFpbHdpbmRjc3MtYW5pbWF0ZVwiOiBcIl4xLjAuN1wiLFxuICAgIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI6IFwiXjAuMTEuMFwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBjcnhqcy92aXRlLXBsdWdpblwiOiBcIl4yLjAuMC1iZXRhLjIzXCIsXG4gICAgXCJAdHlwZXMvY2hyb21lXCI6IFwiXjAuMC4yNjhcIixcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjIwLjE2LjVcIixcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIl4xOC4zLjFcIixcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCJeMTguMy4wXCIsXG4gICAgXCJAdHlwZXMvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI6IFwiXjAuMTAuN1wiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L2VzbGludC1wbHVnaW5cIjogXCJeNy44LjBcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJeNy44LjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMi4xXCIsXG4gICAgXCJhdXRvcHJlZml4ZXJcIjogXCJeMTAuNC4xOVwiLFxuICAgIFwiZXNsaW50XCI6IFwiXjguNTcuMFwiLFxuICAgIFwiZXNsaW50LWNvbmZpZy1wcmV0dGllclwiOiBcIl45LjEuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1pbXBvcnRcIjogXCJeMi4yOS4xXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLWpzeC1hMTF5XCI6IFwiXjYuOC4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0XCI6IFwiXjcuMzQuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1yZWFjdC1ob29rc1wiOiBcIl40LjYuMlwiLFxuICAgIFwiZnMtZXh0cmFcIjogXCJeMTEuMi4wXCIsXG4gICAgXCJub2RlbW9uXCI6IFwiXjMuMS4wXCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4zOFwiLFxuICAgIFwidGFpbHdpbmRjc3NcIjogXCJeMy40LjNcIixcbiAgICBcInRzLW5vZGVcIjogXCJeMTAuOS4yXCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuNC41XCIsXG4gICAgXCJ2aXRlXCI6IFwiXjUuMi4xMVwiXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVgsT0FBTyxXQUFXO0FBQ3ZZLFNBQVMsZUFBZTtBQUN4QixPQUFPLFFBQVE7QUFDZixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLFdBQTZCOzs7QUNKdEM7QUFBQSxFQUNFLGtCQUFvQjtBQUFBLEVBQ3BCLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLGFBQWU7QUFBQSxFQUNmLFlBQWM7QUFBQSxJQUNaLE1BQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxZQUFjO0FBQUEsSUFDWixnQkFBa0I7QUFBQSxJQUNsQixNQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsUUFBVTtBQUFBLElBQ1IsZUFBaUI7QUFBQSxJQUNqQixjQUFnQjtBQUFBLE1BQ2QsTUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsYUFBZTtBQUFBLElBQ2I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGlCQUFtQjtBQUFBLElBQ2pCO0FBQUEsTUFDRSxTQUFXLENBQUMsY0FBYyxlQUFlLFlBQVk7QUFBQSxNQUNyRCxJQUFNLENBQUMsNkJBQTZCO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxlQUFpQjtBQUFBLEVBQ2pCLDBCQUE0QjtBQUFBLElBQzFCO0FBQUEsTUFDRSxXQUFhLENBQUMsZUFBZSxhQUFhLGNBQWMsVUFBVTtBQUFB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
