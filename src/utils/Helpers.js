export function changeRoute(route, data= null) {
    const routePayload = {
        route: route,
        data: data
    };

    window.ipc.send('GOTO_ROUTE', routePayload);
}